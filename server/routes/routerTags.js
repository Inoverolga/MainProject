import express from "express";
import { prisma } from "../lib/prisma.js";

const routerTag = express.Router();

const tagsDemo = ["книги", "техника", "мебель", "офис", "библиотека"];

//создание тэгов в БД
routerTag.post("/test", async (req, res) => {
  try {
    const tags = await prisma.tag.createMany({
      data: [
        { name: "книги" },
        { name: "техника" },
        { name: "мебель" },
        { name: "офис" },
        { name: "библиотека" },
      ],
      skipDuplicates: true,
    });
    res.json(tags);
  } catch (error) {
    console.error(`ошибка создания тегов`);
    res.status(500).json({ error: error.message });
  }
});

routerTag.get("/", (req, res) => {
  try {
    console.log(`Данные о тегах отправлены с сервера`);
    res.json(tagsDemo);
  } catch (error) {
    console.error(`ошибка отправки данных с тегами`);
    res.status(500).json({ error: "Failed" });
  }
});

export default routerTag;

//http://localhost:3001/api/tags - проверка запроса из браузера
//["книги","техника","мебель","офис","библиотека"]
