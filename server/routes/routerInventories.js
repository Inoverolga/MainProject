import express from "express";
import { prisma } from "../lib/prisma.js";

const routerInventories = express.Router();

routerInventories.get("/public", async (req, res) => {
  try {
    console.log(`Данные о публичных инвенторях отправлены с сервера`);
    const inventoriesPublic = await prisma.inventory.findMany({
      where: { isPublic: true },
    });
    res.json(inventoriesPublic);
  } catch (error) {
    console.error(`Ошибка отправки данных:`, error);
    res.status(500).json({ error: "Failed" });
  }
});

//создать тестовые данные инвентарей
routerInventories.post("/test", async (req, res) => {
  try {
    const user = await prisma.user.findFirst();

    if (!user) {
      return res
        .status(400)
        .json({ error: "Сначала создайте пользователя через регистрацию" });
    }

    const testInventory = await prisma.inventory.create({
      data: {
        name: "Мой первый публичный инвентарь",
        description: "Это тестовый инвентарь из БД",
        createdBy: user.name || "Тестовый пользователь",
        isPublic: true,
        userId: user.id,
      },
      include: {
        user: true,
      },
    });

    res.json({
      message: "Тестовые данные созданы!",
      inventory: testInventory,
    });
  } catch (error) {
    console.error("Ошибка создания тестовых данных:", error);
    res.status(500).json({ error: error.message });
  }
});

routerInventories.get("/:id", async (req, res) => {
  try {
    const inventoryId = req.params.id;
    console.log(inventoryId);
    const inventaryItem = await prisma.inventory.findUnique({
      where: {
        id: inventoryId,
      },
    });

    inventaryItem
      ? res.json(inventaryItem)
      : res.status(404).json({ error: "Инвентарь не найден" });
  } catch (error) {
    console.error(`ошибка отправки данных`);
    res.status(500).json({ error: "Failed" });
  }
});

export default routerInventories;
