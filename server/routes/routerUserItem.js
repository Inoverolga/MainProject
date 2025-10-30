import express from "express";
import { prisma } from "../lib/prisma.js";
import { handleError } from "../utils/handleError.js";
import {
  hasWriteAccess,
  getItemWithAccessCheck,
} from "../utils/accessUtils.js";
import { checkToken } from "../middleware/checkToken.js";

const routerUserItem = express.Router();

// Функция подготовки данных товара
const prepareItemData = ({
  tags = [],
  customInt1,
  customInt2,
  customInt3,
  customBool1,
  customBool2,
  customBool3,
  ...data
}) => ({
  ...data,
  customInt1: +customInt1 || null,
  customInt2: +customInt2 || null,
  customInt3: +customInt3 || null,
  customBool1: !!customBool1,
  customBool2: !!customBool2,
  customBool3: !!customBool3,
  tags: {
    connectOrCreate: tags.map((tagName) => ({
      where: { name: tagName },
      create: { name: tagName },
    })),
  },
});

export const fieldsItemSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  customString1: true,
  customString2: true,
  customString3: true,
  customInt1: true,
  customInt2: true,
  customInt3: true,
  customBool1: true,
  customBool2: true,
  customBool3: true,
  customText1: true,
  customText2: true,
  customText3: true,
  tags: true,
};

// Получить все товары инвентаря с кастомными полями
routerUserItem.get("/inventories/:inventoryId/items", async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      where: { inventoryId: req.params.inventoryId },
      select: fieldsItemSelect,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: items });
  } catch (error) {
    handleError(error, res);
  }
});

// Создать товар
routerUserItem.post(
  "/inventories/:inventoryId/items-create",
  checkToken,
  async (req, res) => {
    try {
      const { inventoryId } = req.params;

      const canWrite = await hasWriteAccess(inventoryId, req.user.userId);
      if (!canWrite)
        return res.status(403).json({ success: false, message: "Нет прав" });

      const itemData = prepareItemData(req.body);

      const newItem = await prisma.item.create({
        data: { ...itemData, inventoryId },
        include: { tags: true },
      });

      res.json({
        success: true,
        message: "Товар успешно создан",
        data: newItem,
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

// Получить конкретный товар
routerUserItem.get("/items-edit/:id", checkToken, async (req, res) => {
  try {
    const item = await getItemWithAccessCheck(
      req.params.id,
      req.user?.userId,
      false
    );

    res.json({ success: true, data: item });
  } catch (error) {
    handleError(error, res);
  }
});

// Обновить товар
routerUserItem.put("/items-update/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { version } = req.body;

    await getItemWithAccessCheck(id, req.user.userId, true);

    const updatedItem = await prisma.item.update({
      where: { id, version },
      data: {
        ...prepareItemData(req.body),
        version: { increment: 1 },
      },
      include: { tags: true },
    });

    res.json({
      success: true,
      message: "Товар успешно обновлен",
      data: updatedItem,
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Удалить товар
routerUserItem.delete("/items-delete/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { version } = req.query;

    if (!version) {
      return res.status(400).json({
        success: false,
        message:
          "Не удалось выполнить удаление. Пожалуйста, обновите страницу и попробуйте снова.",
      });
    }

    await getItemWithAccessCheck(id, req.user.userId, true);
    await prisma.item.delete({
      where: { id, version: parseInt(version) },
    });
    res.json({ success: true, message: "Товар успешно удален" });
  } catch (error) {
    handleError(error, res);
  }
});

export default routerUserItem;
