import express from "express";

const routerInventories = express.Router();

export const inventoriesDemo = [
  {
    id: 1,
    name: "Домашняя библиотека",
    description: "Мои книги",
    createdBy: "Ivan",
  },
  {
    id: 2,
    name: "Офисное оборудование",
    description: "Мониторы, системные блоки, принтеры",
    createdBy: "Maria",
  },
  {
    id: 3,
    name: "Мебель",
    description: "столы, стулья, шкафы",
    createdBy: "Piter",
  },
];

routerInventories.get("/public", (req, res) => {
  try {
    console.log(`Данные о публичных инвенторях отправлены с сервера`);
    res.json(inventoriesDemo);
  } catch (error) {
    console.error(`ошибка отправки данных`);
    res.status(500).json({ error: "Failed" });
  }
});

export default routerInventories;
//проверка, что на бэке http://localhost:3001/api/inventories/public -
//Браузер сам отправил GET-запрос на ваш бэкенд и показал результат.
