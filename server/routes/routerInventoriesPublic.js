import express from "express";
import { handleError } from "../utils/handleError.js";
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
    handleError(error, res);
  }
});

routerInventories.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const inventoryItem = await prisma.inventory.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true },
        },
        category: true,
        tags: true,
        items: {
          include: { tags: true },
          orderBy: { createdAt: "desc" },
        },
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
    handleError(error, res);
  }
});
export default routerInventories;
