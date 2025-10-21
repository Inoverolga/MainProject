import express from "express";
import { prisma } from "../lib/prisma.js";

const routerInventories = express.Router();

routerInventories.get("/public", async (req, res) => {
  try {
    const inventoriesPublic = await prisma.inventory.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        name: true,
        description: true,
        createdBy: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(inventoriesPublic);
  } catch (error) {
    console.error(`Ошибка отправки данных:`, error);
    res.status(500).json({ error: "Failed" });
  }
});

routerInventories.get("/:id", async (req, res) => {
  try {
    const inventoryItem = await prisma.inventory.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { name: true, email: true },
        },
        category: true,
        tags: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: "Инвентарь не найден",
      });
    }

    res.json({
      success: true,
      message: "Инвентарь загружен",
      data: inventoryItem,
    });
  } catch (error) {
    console.error(`ошибка отправки данных`);
    res.status(500).json({ message: "Ошибка загрузки инвентаря" });
  }
});

//загружает товары только когда нужны ????
routerInventories.get("/:id/items", async (req, res) => {
  const items = await prisma.item.findMany({
    where: { inventoryId: req.params.id },
  });
  res.json({ success: true, data: items });
});
export default routerInventories;
