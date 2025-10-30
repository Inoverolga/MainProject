import express from "express";
import { prisma } from "../lib/prisma.js";
import { checkToken } from "../middleware/checkToken.js";
import { handleError } from "../utils/handleError.js";
import { hasWriteAccess, hasReadAccess } from "../utils/accessUtils.js";
import { sendMessageToAllUsers } from "../websocket.js";

const routerPosts = express.Router();

// GET /api/posts?inventoryId=xx - Получить сообщения обсуждения
routerPosts.get("/", checkToken, async (req, res) => {
  try {
    const { inventoryId } = req.query;

    if (!inventoryId) {
      return res.status(400).json({
        success: false,
        message: "Не указан инвентарь для загрузки сообщений",
      });
    }

    const hasAccess = await hasReadAccess(inventoryId, req.user.userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Нет доступа к обсуждению этого инвентаря",
      });
    }

    // Получаем сообщения
    const posts = await prisma.post.findMany({
      where: { inventoryId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    handleError(error, res);
  }
});

//  Создать новое сообщение
routerPosts.post("/create-post", checkToken, async (req, res) => {
  try {
    const { content, inventoryId } = req.body;

    if (!inventoryId) {
      return res.status(400).json({
        success: false,
        message: "Не указан инвентарь",
      });
    }

    if (!content?.trim() || content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: !content?.trim()
          ? "Сообщение не может быть пустым"
          : "Сообщение слишком длинное (максимум 2000 символов)",
      });
    }

    const hasAccess = await hasWriteAccess(inventoryId, req.user.userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "У вас нет прав для отправки сообщений в этом инвентаре",
      });
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        inventoryId,
        userId: req.user.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    sendMessageToAllUsers(inventoryId, {
      type: "NEW_MESSAGE",
      data: post,
    });

    res.status(201).json({
      success: true,
      message: "Сообщение успешно отправлено",
      data: post,
    });
  } catch (error) {
    handleError(error, res);
  }
});
export default routerPosts;
