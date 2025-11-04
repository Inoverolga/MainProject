import express from "express";
import { prisma } from "../lib/prisma.js";
import { hasReadAccess } from "../utils/accessUtils.js";
import { checkToken } from "../middleware/checkToken.js";
import { checkAdmin } from "../middleware/checkAdmin.js";
import { handleError } from "../utils/handleError.js";

const routerSearch = express.Router();

export const searchConditions = (query) => ({
  OR: [
    { name: { contains: query, mode: "insensitive" } },
    { description: { contains: query, mode: "insensitive" } },
    { tags: { some: { name: { contains: query, mode: "insensitive" } } } },
    {
      items: {
        some: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { customId: { contains: query, mode: "insensitive" } },
          ],
        },
      },
    },
    { category: { name: { contains: query, mode: "insensitive" } } },
    { user: { name: { contains: query, mode: "insensitive" } } },
  ],
});

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

    if (!query) {
      return res.json({
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    const baseConditions = req.user
      ? searchConditions(query)
      : { isPublic: true, ...searchConditions(query) };

    let inventories = await prisma.inventory.findMany({
      where: baseConditions,
      include: inventoryInclude,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.inventory.count({ where: baseConditions });

    if (req.user) {
      const accessibleInventories = [];
      for (const inventory of inventories) {
        const hasAccess = await hasReadAccess(inventory.id, req.user.userId);
        if (hasAccess) accessibleInventories.push(inventory);
      }
      inventories = accessibleInventories;
    }

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

    if (!query.trim()) {
      return res.json({
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    if (inventoryId) {
      const inventory = await prisma.inventory.findUnique({
        where: { id: inventoryId },
        select: { isPublic: true },
      });

      if (!inventory?.isPublic && !req.user) {
        return res.status(403).json({
          success: false,
          message: "Для просмотра этого инвентаря требуется авторизация",
        });
      }

      if (!inventory?.isPublic && req.user) {
        const hasAccess = await hasReadAccess(inventoryId, req.user.userId);
        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            message: "Нет доступа к этому инвентарю",
          });
        }
      }
    }

    const where = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { customId: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
      ...(inventoryId && { inventoryId }),
    };

    const items = await prisma.item.findMany({
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
    });

    const total = await prisma.item.count({ where });

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
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
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

    if (!query) {
      return res.json({
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    const where = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        {
          inventories: {
            some: {
              name: { contains: query, mode: "insensitive" },
            },
          },
        },
      ],
    };

    const users = await prisma.user.findMany({
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
    });

    const total = await prisma.user.count({ where });

    res.json({
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    handleError(error, res);
  }
});
export default routerSearch;
