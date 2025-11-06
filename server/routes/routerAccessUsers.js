import express from "express";
import { prisma } from "../lib/prisma.js";
import { checkToken } from "../middleware/checkToken.js";
import { handleError } from "../utils/handleError.js";
import { canManagersInventory } from "../utils/accessUtils.js";

const routerAccessUser = express.Router();

const checkManagers = async (req, res, next) => {
  try {
    const inventoryId = req.params.inventoryId;

    if (
      !(await canManagersInventory(
        inventoryId,
        req.user.userId,
        req.user.isAdmin
      ))
    ) {
      return res.status(403).json({
        error: "Только владелец или администратор может управлять доступом",
      });
    }
    next();
  } catch (error) {
    handleError(error, res);
  }
};

routerAccessUser.get(
  "/inventories/:inventoryId/user-list-access",
  checkToken,
  checkManagers,
  async (req, res) => {
    try {
      const accesses = await prisma.inventoryAccess.findMany({
        where: { inventoryId: req.params.inventoryId },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
      res.json({ success: true, data: accesses });
    } catch (error) {
      handleError(error, res);
    }
  }
);

routerAccessUser.post(
  "/:inventoryId/edit-access",
  checkToken,
  checkManagers,
  async (req, res) => {
    try {
      const { userId } = req.body;

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!targetUser)
        return res.status(404).json({ error: "Пользователь не найден" });

      const access = await prisma.inventoryAccess.upsert({
        where: {
          userId_inventoryId: { userId, inventoryId: req.params.inventoryId },
        },
        update: { accessLevel: "WRITE" },
        create: {
          userId,
          inventoryId: req.params.inventoryId,
          accessLevel: "WRITE",
        },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      res.json({ success: true, message: "Доступ предоставлен", data: access });
    } catch (error) {
      handleError(error, res);
    }
  }
);

routerAccessUser.delete(
  "/:inventoryId/:userId/delete-access",
  checkToken,
  checkManagers,
  async (req, res) => {
    try {
      await prisma.inventoryAccess.delete({
        where: {
          userId_inventoryId: {
            userId: req.params.userId,
            inventoryId: req.params.inventoryId,
          },
        },
      });
      res.json({ success: true, message: "Доступ удален" });
    } catch (error) {
      handleError(error, res);
    }
  }
);

routerAccessUser.patch(
  "/:inventoryId/public-access",
  checkToken,
  checkManagers,
  async (req, res) => {
    try {
      const { isPublic } = req.body;
      const inventory = await prisma.inventory.update({
        where: { id: req.params.inventoryId },
        data: { isPublic },
      });

      res.json({
        success: true,
        message: isPublic
          ? "Инвентарь теперь публичный"
          : "Инвентарь теперь приватный",
        data: inventory,
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

export default routerAccessUser;
