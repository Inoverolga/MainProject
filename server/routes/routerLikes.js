import express from "express";
import { prisma } from "../lib/prisma.js";
import { handleError } from "../utils/handleError.js";
import { checkToken } from "../middleware/checkToken.js";

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

routerLikes.get("/:itemId/likes-publicInfo", checkToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.userId;

    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) throw new Error("Товар не найден");

    const recentLikes = await prisma.like.findMany({
      where: { itemId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const likeCount = await prisma.like.count({ where: { itemId } });

    let userLike = null;
    if (userId) {
      userLike = await prisma.like.findUnique({
        where: { userId_itemId: { userId, itemId } },
      });
    }

    res.json({
      success: true,
      data: { likeCount, isLiked: !!userLike, showLastLikes: recentLikes },
    });
  } catch (error) {
    handleError(error, res);
  }
});

export default routerLikes;
