import express from "express";
import { inventoriesDemo } from "./routerInventories.js";

const routerSearch = express.Router();

routerSearch.get("/", (req, res) => {
  //просто "/" так как "/search" уже есть в app.use()
  const querySearch = req.query.q?.toLowerCase() || ""; // получаем параметр ?q=

  const filtered = inventoriesDemo.filter(
    (item) =>
      item.name.toLowerCase().includes(querySearch.toLowerCase()) ||
      item.description.toLowerCase().includes(querySearch.toLowerCase()) ||
      item.createdBy.toLowerCase().includes(querySearch.toLowerCase())
  );

  res.json(filtered);
});

export default routerSearch;

//http://localhost:3001/api/search?q=библиотека - проверка в браузере
//озвращает [{"id":1,"name":"Домашняя библиотека","description":"Мои книги","createdBy":"Ivan"}]
