import express from "express";
import { prisma } from "../lib/prisma.js";
import { checkToken } from "../middleware/checkToken.js";
import { handleError } from "../utils/handleError.js";
import { isInventoryOwner } from "../utils/accessUtils.js";

const routerCustomFields = express.Router();

const FIELD_TARGETS = {
  STRING: ["customString1", "customString2", "customString3"],
  TEXT: ["customText1", "customText2", "customText3"],
  INTEGER: ["customInt1", "customInt2", "customInt3"],
  BOOLEAN: ["customBool1", "customBool2", "customBool3"],
};

const checkFieldOwnership = async (inventoryId, userId) => {
  if (!(await isInventoryOwner(inventoryId, userId))) {
    throw new Error("Только владелец может управлять полями");
  }
};

// Получить список кастомных полей инвентаря - публичный доступ
routerCustomFields.get(
  "/inventories/:inventoryId/fields-public",
  async (req, res) => {
    try {
      const fields = await prisma.inventoryFieldConfig.findMany({
        where: { inventoryId: req.params.inventoryId },
        orderBy: { position: "asc" },
      });
      res.json({ success: true, data: fields });
    } catch (error) {
      handleError(error, res);
    }
  }
);

// Создать поле - ТОЛЬКО ДЛЯ ВЛАДЕЛЬЦА
routerCustomFields.post(
  "/inventories/:inventoryId/fields-create-access",
  checkToken,
  async (req, res) => {
    try {
      const { inventoryId } = req.params;
      const { fieldType, name, description, isVisibleInTable, isRequired } =
        req.body;

      await checkFieldOwnership(inventoryId, req.user.userId);

      // Проверяем лимит полей
      const fieldCount = await prisma.inventoryFieldConfig.count({
        where: { inventoryId, fieldType },
      });
      if (fieldCount >= 3) {
        return res.status(400).json({
          success: false,
          message: `Достигнут лимит полей типа ${fieldType}`,
        });
      }

      // Находим свободное поле
      const emptyField = await prisma.inventoryFieldConfig.findMany({
        where: { inventoryId },
        select: { targetField: true },
      });
      const usedSet = new Set(emptyField.map((f) => f.targetField));
      const availableTarget = FIELD_TARGETS[fieldType].find(
        (t) => !usedSet.has(t)
      );

      if (!availableTarget) {
        return res
          .status(400)
          .json({ success: false, message: "Нет свободных полей этого типа" });
      }

      // Создаем поле
      const position = await prisma.inventoryFieldConfig.count({
        where: { inventoryId },
      });
      const field = await prisma.inventoryFieldConfig.create({
        data: {
          inventoryId,
          fieldType,
          name,
          description,
          isVisibleInTable: isVisibleInTable ?? true,
          isRequired: isRequired ?? false,
          targetField: availableTarget,
          position,
        },
      });

      res.json({ success: true, data: field });
    } catch (error) {
      handleError(error, res);
    }
  }
);

// Удалить поле - ТОЛЬКО ДЛЯ ВЛАДЕЛЬЦА
routerCustomFields.delete(
  "/fields-delete-access/:fieldId",
  checkToken,
  async (req, res) => {
    try {
      const field = await prisma.inventoryFieldConfig.findUnique({
        where: { id: req.params.fieldId },
        include: { inventory: true },
      });

      if (!field) {
        return res
          .status(404)
          .json({ success: false, message: "Поле не найдено" });
      }

      await checkFieldOwnership(field.inventoryId, req.user.userId);

      await prisma.inventoryFieldConfig.delete({
        where: { id: req.params.fieldId },
      });
      res.json({ success: true, message: "Поле удалено" });
    } catch (error) {
      handleError(error, res);
    }
  }
);

routerCustomFields.put(
  "/fields-update-access/:fieldId",
  checkToken,
  async (req, res) => {
    try {
      const { name, description, isVisibleInTable, isRequired } = req.body;

      const field = await prisma.inventoryFieldConfig.findUnique({
        where: { id: req.params.fieldId },
        include: { inventory: true },
      });

      if (!field) {
        return res.status(404).json({
          success: false,
          message: "Поле не найдено",
        });
      }

      await checkFieldOwnership(field.inventoryId, req.user.userId);

      const updatedField = await prisma.inventoryFieldConfig.update({
        where: { id: req.params.fieldId },
        data: {
          name,
          description,
          isVisibleInTable,
          isRequired,
        },
      });

      res.json({ success: true, data: updatedField });
    } catch (error) {
      handleError(error, res);
    }
  }
);
export default routerCustomFields;
