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
