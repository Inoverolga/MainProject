import express from "express";
import { prisma } from "../lib/prisma.js";
import { handleError } from "../utils/handleError.js";
import { checkToken, optionalAuth } from "../middleware/checkToken.js";
import { getItemWithAccessCheck } from "../utils/accessUtils.js";

const routerLikes = express.Router();

const handleLikeAction = (action) => async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.userId;

    await getItemWithAccessCheck(itemId, userId, false, req.user.isAdmin);

    if (action === "create") {
      const existingLike = await prisma.like.findUnique({
        where: { userId_itemId: { userId, itemId } },
      });
      if (existingLike) throw new Error("Лайк уже поставлен");

      await prisma.like.create({ data: { userId, itemId } });
    } else {
      await prisma.like.delete({
        where: { userId_itemId: { userId, itemId } },
      });
    }

    const likeCount = await prisma.like.count({ where: { itemId } });

    res.json({
      success: true,
      data: {
        likeCount,
        isLiked: action === "create",
      },
    });
  } catch (error) {
    handleError(error, res);
  }
};

routerLikes.post(
  "/:itemId/like-create",
  checkToken,
  handleLikeAction("create")
);

routerLikes.delete(
  "/:itemId/like-delete",
  checkToken,
  handleLikeAction("delete")
);

routerLikes.get(
  "/inventory/:inventoryId/likes-publicInfo",
  optionalAuth,
  async (req, res) => {
    try {
      const { inventoryId } = req.params;
      const userId = req.user?.userId;

      const inventory = await prisma.inventory.findUnique({
        where: { id: inventoryId },
        select: { isPublic: true },
      });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Инвентарь не найден",
        });
      }

      if (!inventory.isPublic && !userId) {
        return res.status(403).json({
          success: false,
          message: "Нет доступа к инвентарю",
        });
      }

      const items = await prisma.item.findMany({
        where: { inventoryId },
        select: {
          id: true,
          _count: { select: { likes: true } },
          likes: userId
            ? { where: { userId }, select: { id: true }, take: 1 }
            : false,
        },
      });

      const likes = {};
      items.forEach((item) => {
        likes[item.id] = {
          itemId: item.id,
          likeCount: item._count.likes,
          isLiked: userId ? item.likes.length > 0 : false,
        };
      });

      res.json({ success: true, data: { likes, totalItems: items.length } });
    } catch (error) {
      handleError(error, res);
    }
  }
);

export default routerLikes;
