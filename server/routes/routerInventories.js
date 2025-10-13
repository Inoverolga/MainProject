import express from "express";

const routerInventories = express.Router();

export const inventoriesDemo = [
  {
    id: 1,
    name: "Домашняя библиотека",
    description: "Мои книги",
    createdBy: "Ivan",
    createdAt: "2024-01-15T10:00:00Z",
    isPublic: true,
    itemCount: 45,
    // Для страницы инвентаря:
    items: [
      {
        id: 1,
        name: "Война и мир",
        description: "Роман Л.Н. Толстого",
        customFields: {
          author: "Лев Толстой",
          year: 1869,
          genre: "Роман-эпопея",
        },
      },
      {
        id: 2,
        name: "Преступление и наказание",
        description: "Роман Ф.М. Достоевского",
        customFields: {
          author: "Федор Достоевский",
          year: 1866,
          genre: "Психологический роман",
        },
      },
    ],
  },
  {
    id: 2,
    name: "Офисное оборудование",
    description: "Мониторы, системные блоки, принтеры",
    createdBy: "Maria",
    createdAt: "2024-02-20T14:30:00Z",
    isPublic: true,
    itemCount: 12,
    items: [
      {
        id: 1,
        name: 'Монитор Dell 27"',
        description: "Игровой монитор",
        customFields: {
          brand: "Dell",
          model: "S2721DGF",
          screenSize: 27,
        },
      },
    ],
  },
  {
    id: 3,
    name: "Мебель",
    description: "столы, стулья, шкафы",
    createdBy: "Piter",
    createdAt: "2024-02-20T14:30:00Z",
    isPublic: true,
    itemCount: 12,
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

routerInventories.get("/:id", (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    console.log(itemId);
    const inventaryItem = inventoriesDemo.find((item) => item.id === itemId);

    inventaryItem
      ? res.json(inventaryItem)
      : res.status(404).json({ error: "Инвентарь не найден" });
  } catch (error) {
    console.error(`ошибка отправки данных`);
    res.status(500).json({ error: "Failed" });
  }
});

export default routerInventories;
//проверка, что на бэке http://localhost:3001/api/inventories/public -
//Браузер сам отправил GET-запрос на ваш бэкенд и показал результат.

//проверка бэка для товаров из инвентаря
//http://localhost:3001/api/inventories/1
//{"id":1,"name":"Домашняя библиотека","description":"Мои книги","createdBy":"Ivan","createdAt":"2024-01-15T10:00:00Z","isPublic":true,"itemCount":45,
// "items":[{"id":1,"name":"Война и мир","description":"Роман Л.Н. Толстого","customFields":{"author":"Лев Толстой","year":1869,"genre":"Роман-эпопея"}},
// {"id":2,"name":"Преступление и наказание","description":"Роман Ф.М. Достоевского","customFields":{"author":"Федор Достоевский","year":1866,"genre":"Психологический роман"}}]}
