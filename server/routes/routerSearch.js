import express from "express";
import { prisma } from "../lib/prisma.js";
import { checkToken } from "../middleware/checkToken.js";
import { checkAdmin } from "../middleware/checkAdmin.js";
import { handleError } from "../utils/handleError.js";

const routerSearch = express.Router();

export const searchConditions = (query) => {
  const searchTerm = query.trim();
  if (!searchTerm || searchTerm.length < 2) return {};

  return {
    OR: [
      { name: { startsWith: searchTerm, mode: "insensitive" } },
      { description: { startsWith: searchTerm, mode: "insensitive" } },
      {
        tags: {
          some: { name: { startsWith: searchTerm, mode: "insensitive" } },
        },
      },
    ],
  };
};

export const inventoryInclude = {
  user: { select: { name: true, email: true } },
  tags: true,
  category: true,
  _count: { select: { items: true } },
};

routerSearch.get("/", async (req, res) => {
  try {
    const query = req.query.q?.trim() || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!query || query.length < 2) {
      return res.json({
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    let accessibleInventoryIds = [];

    if (req.user) {
      const accesses = await prisma.inventoryAccess.findMany({
        where: { userId: req.user.userId },
        select: { inventoryId: true },
      });
      accessibleInventoryIds = accesses.map((acc) => acc.inventoryId);
    }

    const baseConditions = {
      AND: [
        searchConditions(query),
        req.user
          ? {
              OR: [
                { isPublic: true },
                { id: { in: accessibleInventoryIds } },
                { userId: req.user.userId },
              ],
            }
          : { isPublic: true },
      ],
    };

    const [inventories, total] = await Promise.all([
      prisma.inventory.findMany({
        where: baseConditions,
        include: inventoryInclude,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.inventory.count({ where: baseConditions }),
    ]);

    res.json({
      data: inventories,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    handleError(error, res);
  }
});

routerSearch.get("/items", async (req, res) => {
  try {
    const { q: query = "", inventoryId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!query.trim() || query.length < 2) {
      return res.json({
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    if (inventoryId) {
      const inventory = await prisma.inventory.findUnique({
        where: { id: inventoryId },
        select: { id: true },
      });

      if (!inventory) {
        throw new Error("Инвентарь не найден");
      }
    }
    const where = {
      OR: [
        { name: { startsWith: query, mode: "insensitive" } },
        { customId: { startsWith: query, mode: "insensitive" } },
        { description: { startsWith: query, mode: "insensitive" } },
      ],
      ...(inventoryId && { inventoryId }),
    };

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          inventory: {
            select: {
              id: true,
              name: true,
              isPublic: true,
              user: { select: { name: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.item.count({ where }),
    ]);

    res.json({
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    handleError(error, res);
  }
});

routerSearch.get("/users", checkToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { startsWith: q, mode: "insensitive" } },
          { name: { startsWith: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true },
      take: 10,
    });

    res.json(users);
  } catch (error) {
    handleError(error, res);
  }
});

//не использовала
routerSearch.get("/tags", async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { isPublic: true },
      select: { name: true },
      take: 30,
    });

    const tagNames = tags.map((tag) => tag.name);
    res.json(tagNames);
  } catch (error) {
    handleError(error, res);
  }
});

routerSearch.get("/admin", checkToken, checkAdmin, async (req, res) => {
  try {
    const query = req.query.q?.trim() || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!query || query.length < 2) {
      return res.json({
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    const where = {
      OR: [
        { name: { startsWith: query, mode: "insensitive" } },
        { email: { startsWith: query, mode: "insensitive" } },
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          inventories: {
            select: {
              id: true,
              name: true,
              isPublic: true,
              createdAt: true,
              _count: { select: { items: true } },
            },
            take: 5,
          },
          _count: {
            select: { inventories: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    handleError(error, res);
  }
});
export default routerSearch;
