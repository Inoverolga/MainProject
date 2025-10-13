import express from "express";

const routerTag = express.Router();

const tagsDemo = ["книги", "техника", "мебель", "офис", "библиотека"];

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
