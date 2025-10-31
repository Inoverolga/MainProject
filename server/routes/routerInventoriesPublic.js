import express from "express";
import { handleError } from "../utils/handleError.js";
import { prisma } from "../lib/prisma.js";

const routerInventories = express.Router();

//получение инвентарей для публичного доступа(в т.ч. популярных)
routerInventories.get("/public", async (req, res) => {
  try {
    const { type = "recent", page = 1 } = req.query;

    let orderBy = {};
    let take = undefined;
    let skip = undefined;

    if (type === "popular") {
      orderBy = [
        { views: "desc" },
        { items: { _count: "desc" } },
        { updatedAt: "desc" },
      ];
      take = 5;
    } else {
      orderBy = { createdAt: "desc" };
      take = 10;
      skip = (parseInt(page) - 1) * take;
    }

    const inventories = await prisma.inventory.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
      orderBy,
      skip,
      take,
    });

    res.json(inventories);
  } catch (error) {
    handleError(error, res);
  }
});

//инвентарь+товар публичный
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

    prisma.inventory
      .update({
        where: { id: req.params.id },
        data: { views: { increment: 1 } },
      })
      .catch(console.error);

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
