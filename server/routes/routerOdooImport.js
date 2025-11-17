import express from "express";
import { handleError } from "../utils/handleError.js";
import { checkToken } from "../middleware/checkToken.js";
import axios from "axios";
import xmlrpc from "xmlrpc";

const routerOdooImport = express.Router();

const ODOO_CONFIG = {
  host: "odoo-render-setup.onrender.com",
  port: 443,
  db: "dbOdoo2",
  username: "Kuzma-InoverOlga@mail.ru",
  password: "inover2025",
};

const BASE_URL = process.env.BACKEND_URL || "http://localhost:3001";

const createOdooClient = (path = "/xmlrpc/2/common") =>
  xmlrpc.createSecureClient({
    host: ODOO_CONFIG.host,
    port: ODOO_CONFIG.port,
    path,
  });

const callOdooMethod = (client, method, args = []) =>
  new Promise((resolve, reject) => {
    client.methodCall(method, args, (error, value) => {
      error ? reject(error) : resolve(value);
    });
  });

const prepareAggregations = (aggregations = {}) => {
  const result = { numeric: {}, text: {}, boolean: {} };

  Object.entries(aggregations).forEach(([fieldName, fieldData]) => {
    const type = fieldData.type;
    if (type === "number") result.numeric[fieldName] = fieldData;
    else if (type === "string") result.text[fieldName] = fieldData;
    else if (type === "boolean" || type === "bool")
      result.boolean[fieldName] = fieldData;
  });

  return result;
};

const createRecord = async (client, uid, data, inventoryId, odooApiToken) => {
  const recordId = await callOdooMethod(client, "execute_kw", [
    ODOO_CONFIG.db,
    uid,
    ODOO_CONFIG.password,
    "x_inventory.data",
    "create",
    [
      {
        x_name: data.inventory?.name || `Инвентаризация ${inventoryId}`,
        x_api_token: odooApiToken,
        x_external_id: inventoryId,
        x_total_count: data.aggregations?.total_count || 0,
        x_field_definitions: JSON.stringify(data.inventory?.fields || []),
        x_last_sync: new Date().toISOString(),
        x_last_sync_result: `Успешно: ${
          data.aggregations?.total_count || 0
        } элементов`,
      },
    ],
  ]);

  return recordId;
};

const updateRecord = async (client, uid, recordId, data, inventoryId) => {
  const aggregations = prepareAggregations(
    data.aggregations?.fields_aggregation
  );

  const formatFields = (fields) => {
    if (!fields || fields.length === 0) return "Нет полей";
    return fields
      .map(
        (field) =>
          ` ${field.name} (${field.type})` +
          (field.description ? ` - ${field.description}` : "")
      )
      .join("\n");
  };

  const formatNumericAggregations = (numericAggr) => {
    if (!numericAggr || Object.keys(numericAggr).length === 0)
      return "Нет числовых данных";

    return Object.entries(numericAggr)
      .map(([fieldName, fieldData]) => {
        const stats = [];
        if (fieldData.average !== undefined)
          stats.push(`среднее: ${fieldData.average}`);
        if (fieldData.min !== undefined)
          stats.push(`минимум: ${fieldData.min}`);
        if (fieldData.max !== undefined)
          stats.push(`максимум: ${fieldData.max}`);
        if (fieldData.count !== undefined)
          stats.push(`всего: ${fieldData.count}`);

        return ` ${fieldName}: ${stats.join(", ")}`;
      })
      .join("\n");
  };

  const formatTextAggregations = (textAggr) => {
    if (!textAggr || Object.keys(textAggr).length === 0)
      return "Нет текстовых данных";

    return Object.entries(textAggr)
      .map(([fieldName, fieldData]) => {
        const topValues =
          fieldData.top_values
            ?.slice(0, 3)
            .map((item) => `"${item.value}" - ${item.percentage}%`)
            .join(", ") || "нет данных";

        return `${fieldName}:\n   Популярные: ${topValues}\n   Уникальных: ${
          fieldData.unique_count || 0
        }`;
      })
      .join("\n\n");
  };

  const formatBooleanAggregations = (booleanAggr) => {
    if (!booleanAggr || Object.keys(booleanAggr).length === 0)
      return "Нет булевых данных";

    return Object.entries(booleanAggr)
      .map(
        ([fieldName, fieldData]) =>
          ` ${fieldName}: ${fieldData.count || 0} элементов`
      )
      .join("\n");
  };

  await callOdooMethod(client, "execute_kw", [
    ODOO_CONFIG.db,
    uid,
    ODOO_CONFIG.password,
    "x_inventory.data",
    "write",
    [
      [recordId],
      {
        x_name: data.inventory?.name || `Инвентаризация ${inventoryId}`,
        x_total_count: data.aggregations?.total_count || 0,

        x_field_definitions: formatFields(data.inventory?.fields || []),
        x_numeric_aggregations: formatNumericAggregations(aggregations.numeric),
        x_text_aggregations: formatTextAggregations(aggregations.text),
        x_boolean_aggregations: formatBooleanAggregations(aggregations.boolean),

        x_last_sync: new Date().toISOString(),
        x_last_sync_result: `Успешно: ${
          data.aggregations?.total_count || 0
        } элементов синхронизировано`,
      },
    ],
  ]);
};

const getImportedDataSummary = (data) => ({
  inventory_name: data.inventory?.name,
  total_count: data.aggregations?.total_count || 0,
  fields_count: data.inventory?.fields?.length || 0,
  aggregations_count: Object.keys(data.aggregations?.fields_aggregation || {})
    .length,
});

routerOdooImport.post(
  "/:inventoryId/import-to-odoo",
  checkToken,
  async (req, res) => {
    try {
      const { inventoryId } = req.params;
      const { odooApiToken } = req.body;

      if (!odooApiToken) {
        return res.status(400).json({ error: "API токен Odoo обязателен" });
      }

      const apiUrl = `${BASE_URL}/api/odoo/${odooApiToken}/aggregateddata`;
      const { data } = await axios.get(apiUrl, { timeout: 30000 });

      const outhClient = createOdooClient();
      const uid = await callOdooMethod(outhClient, "authenticate", [
        ODOO_CONFIG.db,
        ODOO_CONFIG.username,
        ODOO_CONFIG.password,
        {},
      ]);

      if (uid === false) throw new Error("Аутентификация в Odoo не удалась");

      const objectClient = createOdooClient("/xmlrpc/2/object");
      const existingRecords = await callOdooMethod(objectClient, "execute_kw", [
        ODOO_CONFIG.db,
        uid,
        ODOO_CONFIG.password,
        "x_inventory.data",
        "search_read",
        [[["x_api_token", "=", odooApiToken]]],
        { fields: ["id", "x_name"] },
      ]);

      const recordId =
        existingRecords[0]?.id ||
        (await createRecord(
          objectClient,
          uid,
          data,
          inventoryId,
          odooApiToken
        ));

      await updateRecord(objectClient, uid, recordId, data, inventoryId);

      res.json({
        success: true,
        message: "Данные успешно импортированы в Odoo",
        record_id: recordId,
        imported_data: getImportedDataSummary(data),
        odoo_database: ODOO_CONFIG.db,
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

export default routerOdooImport;
