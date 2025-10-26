import express from "express";
import { prisma } from "../lib/prisma.js";
import { hasReadAccess } from "../utils/accessUtils.js";
import { checkToken } from "../middleware/checkToken.js";
import jwt from "jsonwebtoken";

const routerSearch = express.Router();

const buildSearchConditions = (query) => ({
  OR: [
    { name: { startsWith: query, mode: "insensitive" } },
    { description: { contains: query, mode: "insensitive" } },
    { tags: { some: { name: { startsWith: query, mode: "insensitive" } } } },
    { items: { some: { name: { startsWith: query, mode: "insensitive" } } } },
  ],
});

const inventoryInclude = {
  user: { select: { name: true, email: true } },
  tags: true,
  category: true,
  _count: { select: { items: true } },
};

// 1. ОБЩИЙ ПОИСК (публичные инвентари)
routerSearch.get("/", async (req, res) => {
  try {
    const query = req.query.q?.trim() || "";
    if (!query) return res.json([]);

    const results = await prisma.inventory.findMany({
      where: {
        AND: [{ isPublic: true }, buildSearchConditions(query)],
      },
      include: inventoryInclude,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ success: false, message: "Ошибка поиска" });
  }
});

// 2. ПЕРСОНАЛЬНЫЙ ПОИСК (все доступные инвентари)
routerSearch.get("/personal", checkToken, async (req, res) => {
  try {
    const { q: query = "" } = req.query;
    if (!query.trim()) return res.json([]);

    const allInventories = await prisma.inventory.findMany({
      where: buildSearchConditions(query),
      include: inventoryInclude,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Фильтруем по правам доступа
    const accessibleInventories = [];
    for (const inventory of allInventories) {
      const hasAccess = await hasReadAccess(inventory.id, req.user.userId);
      if (hasAccess) {
        accessibleInventories.push(inventory);
      }
    }

    res.json(accessibleInventories);
  } catch (error) {
    res.status(500).json({ success: false, message: "Ошибка поиска" });
  }
});

// 3. ПОИСК ТОВАРОВ
routerSearch.get("/items", async (req, res) => {
  try {
    const { q: query = "", inventoryId } = req.query;
    if (!query.trim()) return res.json([]);

    const searchConditions = {
      OR: [
        { name: { startsWith: query, mode: "insensitive" } },
        { customId: { startsWith: query, mode: "insensitive" } },
      ],
      ...(inventoryId && { inventoryId }),
    };

    const results = await prisma.item.findMany({
      where: searchConditions,
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
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json(results);
  } catch (error) {
    console.error("Ошибка поиска товаров:", error);
    res.status(500).json({ success: false, message: "Ошибка поиска товаров" });
  }
});
export default routerSearch;

// GET /api/search?q=... - общий поиск (публичные инвентари)

// GET /api/search/personal?q=... - персональный поиск (требует авторизации)

// GET /api/search/items?q=... - поиск товаров

// Визуализация:
// text
// ГЛАВНАЯ СТРАНИЦА
// ├── Поиск инвентарей → /api/search?q=...
// └── Облако тегов → /api/search?q=#тег

// ЛИЧНЫЙ КАБИНЕТ
// ├── Мои инвентари → /api/search/personal?q=...
// └── Инвентари с доступом → /api/search/personal?q=...

// СТРАНИЦА ИНВЕНТАРЯ
// └── Товары инвентаря → /api/search/items?q=...&inventoryId=123

// ОБЩИЙ ПОИСК
// ├── Для гостей → /api/search?q=...
// └── Для пользователей → /api/search/personal?q=...

// АДМИН-ПАНЕЛЬ
// └── Поиск пользователей → /api/admin/users?q=... (отдельный эндпоинт)
// На верхнем заголовке (хедер):
// javascript

// // Умный поиск - определяет контекст:
// if (на главной странице) {
//   fetch(`/api/search?q=${query}`)
// } else if (в личном кабинете) {
//   fetch(`/api/search/personal?q=${query}`)
// } else if (на странице инвентаря) {
//   fetch(`/api/search/items?q=${query}&inventoryId=...`)
// } else {
//   // общий поиск
//   fetch(`/api/search?q=${query}`)
// }
