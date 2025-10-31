import express from "express";
import { prisma } from "../lib/prisma.js";
import { handleError } from "../utils/handleError.js";
import { checkToken, optionalAuth } from "../middleware/checkToken.js";

const routerLikes = express.Router();

//Добавление лайков
routerLikes.post("/:itemId/like-create", checkToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.userId;

    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) throw new Error("Товар не найден");

    const existingLike = await prisma.like.findUnique({
      where: { userId_itemId: { userId, itemId } },
    });
    if (existingLike) throw new Error("Лайк уже поставлен");

    const like = await prisma.like.create({
      data: { userId, itemId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const likeCount = await prisma.like.count({ where: { itemId } });

    res.json({ success: true, data: { likeCount, isLiked: true, like } });
  } catch (error) {
    handleError(error, res);
  }
});

routerLikes.delete("/:itemId/like-delete", checkToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.userId;

    await prisma.like.delete({ where: { userId_itemId: { userId, itemId } } });
    const likeCount = await prisma.like.count({ where: { itemId } });

    res.json({ success: true, data: { likeCount, isLiked: false } });
  } catch (error) {
    handleError(error, res);
  }
});

routerLikes.get(
  "/inventory/:inventoryId/likes-publicInfo",
  optionalAuth,
  async (req, res) => {
    try {
      const { inventoryId } = req.params;
      const userId = req.user?.userId;

      // Проверяем инвентарь и загружаем лайки в одном запросе
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

      // Создаем объект лайков
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
