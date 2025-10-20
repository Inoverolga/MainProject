import express from "express";
import { prisma } from "../lib/prisma.js";

const routerTag = express.Router();

//фильтруем на стороне сервера
routerTag.get("/autocompletion", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const tags = await prisma.tag.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      select: { name: true },
      orderBy: { name: "asc" },
      take: 10,
    });

    const tagNames = tags.map((tag) => tag.name);
    res.json(tagNames);
  } catch (error) {
    console.error(`Ошибка загрузки suggestions:`, error);
    res.status(500).json({ error: "Ошибка загрузки тегов" });
  }
});

//если получаем все тэги, и фильтруем  на стороне клиента (не использую...)
routerTag.get("/", async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });

    const tagNames = tags.map((tag) => tag.name);

    console.log(`Теги из БД отправлены:`, tagNames);
    res.json(tagNames);
  } catch (error) {
    console.error(`Ошибка загрузки тегов:`, error);
    res.status(500).json({ error: "Ошибка загрузки тегов" });
  }
});

export default routerTag;
