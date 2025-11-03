import express from "express";
import { prisma } from "../lib/prisma.js";
import { checkToken } from "../middleware/checkToken.js";
import { handleError } from "../utils/handleError.js";
import { checkAdmin } from "../middleware/checkAdmin.js";

const routerAdmin = express.Router();

//список пользователей
routerAdmin.get("/users", checkToken, checkAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isBlocked: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { inventories: true, posts: true, likes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.user.count({ where });

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});

routerAdmin.get("/users/:userId", checkToken, checkAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isBlocked: true,
        createdAt: true,
        lastLoginAt: true,
        loginAttempts: true,
        blockedUntil: true,
        _count: {
          select: {
            inventories: true,
            inventoryAccesses: true,
            posts: true,
            likes: true,
          },
        },
        inventories: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            createdAt: true,
            _count: { select: { items: true } },
          },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Пользователь не найден" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    handleError(error, res);
  }
});

routerAdmin.patch(
  "/users/:userId/block",
  checkToken,
  checkAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { isBlocked } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          isBlocked: Boolean(isBlocked),
          ...(isBlocked === false && { loginAttempts: 0, blockedUntil: null }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          isBlocked: true,
          isAdmin: true,
        },
      });

      res.json({
        success: true,
        message: `Пользователь ${isBlocked ? "заблокирован" : "разблокирован"}`,
        data: user,
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

routerAdmin.patch(
  "/users/:userId/role",
  checkToken,
  checkAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { isAdmin } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { isAdmin: Boolean(isAdmin) },
        select: {
          id: true,
          email: true,
          name: true,
          isAdmin: true,
          isBlocked: true,
        },
      });

      res.json({
        success: true,
        message: `Права администратора ${isAdmin ? "назначены" : "сняты"}`,
        data: user,
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

routerAdmin.delete(
  "/users/:userId",
  checkToken,
  checkAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      if (userId === req.user.userId) {
        return res.status(400).json({
          success: false,
          message: "Нельзя удалить самого себя",
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.inventoryAccess.deleteMany({ where: { userId } });
        await tx.like.deleteMany({ where: { userId } });
        await tx.post.deleteMany({ where: { userId } });
        await tx.inventory.deleteMany({ where: { userId } });
        await tx.user.delete({ where: { id: userId } });
      });

      res.json({
        success: true,
        message: "Пользователь успешно удален",
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

// Эндпоинты для статистики
routerAdmin.get("/stats", checkToken, checkAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalAdmins = await prisma.user.count({ where: { isAdmin: true } });
    const totalBlockedUsers = await prisma.user.count({
      where: { isBlocked: true },
    });
    const totalInventories = await prisma.inventory.count();
    const totalItems = await prisma.item.count();
    const totalPosts = await prisma.post.count();
    const totalLikes = await prisma.like.count();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalBlockedUsers,
        totalInventories,
        totalItems,
        totalPosts,
        totalLikes,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});
export default routerAdmin;
