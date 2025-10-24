import express from "express";
import { prisma } from "../lib/prisma.js";
import {
  hasReadAccess,
  hasWriteAccess,
  getItemWithAccessCheck,
} from "../utils/accessUtils.js";
import { checkToken } from "../middleware/checkToken.js";

const routerUserItem = express.Router();

// Получить все товары инвентаря
routerUserItem.get("/inventories/:inventoryId/items", async (req, res) => {
  try {
    const { inventoryId } = req.params;
    //     const hasAccess = await hasReadAccess(inventoryId, req.user?.userId);
    //     if (!hasAccess)
    //       return res
    //         .status(403)
    //         .json({ success: false, message: "Нет доступа к инвентарю" });

    const items = await prisma.item.findMany({
      where: { inventoryId },
      include: { tags: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: items });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Ошибка при загрузке товаров" });
  }
});

// Создать товар
routerUserItem.post(
  "/inventories/:inventoryId/items-create",
  checkToken,
  async (req, res) => {
    try {
      const { inventoryId } = req.params;
      const { name, description, tags = [] } = req.body;

      const canWrite = await hasWriteAccess(inventoryId, req.user.userId);
      if (!canWrite)
        return res
          .status(403)
          .json({ success: false, message: "Нет прав на создание товаров" });

      const newItem = await prisma.item.create({
        data: {
          name,
          description,
          inventoryId,
          tags: {
            connectOrCreate: tags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          },
        },
        include: { tags: true },
      });

      res.json({
        success: true,
        message: "Товар успешно создан",
        data: newItem,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Ошибка при создании товара" });
    }
  }
);

// Получить конкретный товар
routerUserItem.get("/items-adit/:id", checkToken, async (req, res) => {
  try {
    const item = await getItemWithAccessCheck(
      req.params.id,
      req.user?.userId,
      false
    );
    res.json({ success: true, data: item });
  } catch (error) {
    const status = error.message.includes("не найден")
      ? 404
      : error.message.includes("доступ")
      ? 403
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
});

// Обновить товар
routerUserItem.put("/items-update/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, tags = [] } = req.body;

    await getItemWithAccessCheck(id, req.user.userId, true); // Проверка доступа

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        name,
        description,
        tags: {
          set: [],
          connectOrCreate: tags.map((tagName) => ({
            where: { name: tagName },
            create: { name: tagName },
          })),
        },
      },
      include: { tags: true },
    });

    res.json({
      success: true,
      message: "Товар успешно обновлен",
      data: updatedItem,
    });
  } catch (error) {
    const status = error.message.includes("не найден")
      ? 404
      : error.message.includes("прав")
      ? 403
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
});

// Удалить товар
routerUserItem.delete("/items-delete/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    await getItemWithAccessCheck(id, req.user.userId, true); // Проверка доступа
    await prisma.item.delete({ where: { id } });
    res.json({ success: true, message: "Товар успешно удален" });
  } catch (error) {
    const status = error.message.includes("не найден")
      ? 404
      : error.message.includes("прав")
      ? 403
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
});
export default routerUserItem;
