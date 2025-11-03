import express from "express";
import { prisma } from "../lib/prisma.js";
import { checkToken } from "../middleware/checkToken.js";
import { handleError } from "../utils/handleError.js";
import { hasReadAccess } from "../utils/accessUtils.js";
import pkg from "lodash";
const { compact, mean, round } = pkg;

const routerStats = express.Router();

function getFieldStats(items, fieldConfigs, fieldNames) {
  const stats = {};

  for (const field of fieldNames) {
    const values = compact(items.map((item) => item[field])).filter((value) => {
      if (typeof value === "string") return value.trim() !== "";
      return true;
    });

    if (values.length > 0) {
      const config = fieldConfigs.find((c) => c.targetField === field);
      if (config) {
        const filledPercentage = round((values.length / items.length) * 100);
        const fieldData = {
          name: config.name,
          count: values.length,
          filledPercentage,
        };

        if (field.startsWith("customInt")) {
          fieldData.average = round(mean(values), 2);
        } else if (field.startsWith("customString")) {
          const unique = new Set(values);
          fieldData.uniqueCount = unique.size;
        } else if (field.startsWith("customBool")) {
          const trueCount = values.filter((v) => v === true).length;
          fieldData.truePercentage = round((trueCount / values.length) * 100);
          fieldData.falsePercentage = 100 - fieldData.truePercentage;
        }

        stats[field] = fieldData;
      }
    }
  }

  return stats;
}

routerStats.get("/inventories/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!(await hasReadAccess(id, userId))) {
      return res.status(403).json({ error: "Нет доступа" });
    }

    const items = await prisma.item.findMany({
      where: { inventoryId: id },
      select: {
        customInt1: true,
        customInt2: true,
        customInt3: true,
        customString1: true,
        customString2: true,
        customString3: true,
        customText1: true,
        customText2: true,
        customText3: true,
        customBool1: true,
        customBool2: true,
        customBool3: true,
      },
    });

    const fieldConfigs = await prisma.inventoryFieldConfig.findMany({
      where: { inventoryId: id },
      select: { targetField: true, name: true },
      orderBy: { position: "asc" },
    });

    const inventory = await prisma.inventory.findUnique({
      where: { id },
      select: {
        name: true,
        description: true,
        user: { select: { name: true, email: true } },
      },
    });

    const itemsCount = items.length;

    const totalFilled = fieldConfigs.reduce((sum, config) => {
      return (
        sum +
        compact(items.map((item) => item[config.targetField])).filter((value) =>
          typeof value === "string" ? value.trim() !== "" : true
        ).length
      );
    }, 0);

    const totalPossible = itemsCount * fieldConfigs.length;
    const overallCompletion =
      totalPossible > 0 ? round((totalFilled / totalPossible) * 100) : 0;

    res.json({
      inventoryName: inventory.name,
      inventoryDescription: inventory.description,
      creator: inventory.user.name || inventory.user.email,
      itemsCount,
      totalFields: fieldConfigs.length,
      overallCompletion,
      fieldTypes: {
        numbers: {
          title: "Числовые поля",
          fields: getFieldStats(items, fieldConfigs, [
            "customInt1",
            "customInt2",
            "customInt3",
          ]),
        },
        strings: {
          title: "Текстовые поля",
          fields: getFieldStats(items, fieldConfigs, [
            "customString1",
            "customString2",
            "customString3",
          ]),
        },
        text: {
          title: "Многострочный текст",
          fields: getFieldStats(items, fieldConfigs, [
            "customText1",
            "customText2",
            "customText3",
          ]),
        },
        booleans: {
          title: "Да/Нет поля",
          fields: getFieldStats(items, fieldConfigs, [
            "customBool1",
            "customBool2",
            "customBool3",
          ]),
        },
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});
export default routerStats;
