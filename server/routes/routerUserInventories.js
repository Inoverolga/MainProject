import express from "express";
import { prisma } from "../lib/prisma.js";
import { checkToken } from "../middleware/checkToken.js";
import { Parser } from "json2csv";
import {
  isInventoryOwner,
  hasWriteAccess,
  hasReadAccess,
} from "../utils/accessUtils.js";

const routerUserInventories = express.Router();

const findCategoryId = async (categoryName) => {
  if (!categoryName) return null;
  const categoryRecord = await prisma.category.findFirst({
    where: { name: categoryName },
  });
  return categoryRecord?.id || null;
};

export const inventoryInclude = {
  _count: { select: { items: true } },
};

routerUserInventories.get("/me/inventories", checkToken, async (req, res) => {
  try {
    const inventories = await prisma.inventory.findMany({
      where: { userId: req.user.userId },
      include: inventoryInclude,
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: inventories });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Ошибка при загрузке инвентарей" });
  }
});

routerUserInventories.get(
  "/me/accessible-inventories",
  checkToken,
  async (req, res) => {
    try {
      const accessible = await prisma.inventoryAccess.findMany({
        where: { userId: req.user.userId, accessLevel: "WRITE" },
        include: {
          inventory: {
            include: {
              ...inventoryInclude,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { inventory: { createdAt: "desc" } },
      });

      const inventories = accessible.map((access) => ({
        ...access.inventory,
        accessLevel: access.accessLevel,
      }));

      res.json({ success: true, data: inventories });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Ошибка при загрузке доступных инвентарей",
      });
    }
  }
);

// Защищенный роут с правами доступа
routerUserInventories.get(
  "/inventories/:id/items-with-access",
  checkToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const inventoryItem = await prisma.inventory.findUnique({
        where: { id },
        include: {
          user: { select: { name: true, email: true, id: true } },
          category: true,
          tags: true,
          items: {
            include: { tags: true },
            orderBy: { createdAt: "desc" },
          },
          _count: { select: { items: true } },
        },
      });

      if (!inventoryItem) {
        return res
          .status(404)
          .json({ success: false, message: "Инвентарь не найден" });
      }

      let canWrite = false;
      if (userId) {
        canWrite =
          inventoryItem.userId === userId || (await hasWriteAccess(id, userId));
      }

      res.json({
        success: true,
        message: "Инвентарь загружен",
        data: { ...inventoryItem, canWrite },
      });
    } catch (error) {
      console.error("Ошибка загрузки инвентаря:", error);
      res
        .status(500)
        .json({ success: false, message: "Ошибка загрузки инвентаря" });
    }
  }
);

//создание инвентаря
routerUserInventories.post(
  "/inventories-create",
  checkToken,
  async (req, res) => {
    try {
      const {
        name,
        description,
        category,
        tags = [],
        isPublic,
        ...rest
      } = req.body.arg || req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { name: true },
      });

      const categoryId = await findCategoryId(category);

      if (category && !categoryId) {
        return res
          .status(400)
          .json({ success: false, message: "Категория не найдена" });
      }

      const newInventory = await prisma.inventory.create({
        data: {
          name,
          description,
          categoryId,
          createdBy: user?.name || "Неизвестный пользователь",
          isPublic: Boolean(isPublic),
          userId: req.user.userId,
          tags: {
            connectOrCreate: tags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          },
        },
      });

      res.json({
        success: true,
        message: "Инвентарь успешно создан!",
        data: newInventory,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Ошибка при создании инвентаря" });
    }
  }
);

//удаление инвентаря
routerUserInventories.delete(
  "/inventories-delete/:id",
  checkToken,
  async (req, res) => {
    try {
      const isOwner = await isInventoryOwner(req.params.id, req.user.userId);

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "Только владелец может удалить инвентарь",
        });
      }

      await prisma.inventory.delete({ where: { id: req.params.id } });

      res.json({ success: true, message: "Инвентарь удален" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Ошибка при удалении инвентаря" });
    }
  }
);

//редактирование инвентаря-получение данных для редактирования
routerUserInventories.get(
  "/inventories-edit/:id",
  checkToken,
  async (req, res) => {
    try {
      const hasAccess = await hasWriteAccess(req.params.id, req.user.userId);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Инвентарь не найден или нет доступа",
        });
      }

      const inventory = await prisma.inventory.findFirst({
        where: { id: req.params.id },
        select: {
          id: true,
          name: true,
          description: true,
          isPublic: true,
          category: { select: { id: true, name: true } },
          tags: { select: { id: true, name: true } },
        },
      });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Инвентарь не найден",
        });
      }

      res.json({ success: true, data: inventory });
    } catch (error) {
      res.status(500).json({ success: false, message: "Ошибка загрузки" });
    }
  }
);

routerUserInventories.put(
  "/inventories-update/:id",
  checkToken,
  async (req, res) => {
    try {
      const { name, description, category, tags = [], isPublic } = req.body;

      if (!name?.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Название обязательно" });
      }

      if (!description?.trim() || description.length < 10) {
        return res.status(400).json({
          success: false,
          message: "Описание должно быть не менее 10 символов",
        });
      }

      const isOwner = await isInventoryOwner(req.params.id, req.user.userId);

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "Только владелец может редактировать инвентарь",
        });
      }

      const categoryId = await findCategoryId(category);

      const updatedInventory = await prisma.inventory.update({
        where: { id: req.params.id },
        data: {
          name: name.trim(),
          description: description.trim(),
          categoryId,
          isPublic: Boolean(isPublic),
          tags: {
            set: [],
            connectOrCreate: tags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          },
        },
        include: { tags: true, category: true },
      });

      res.json({
        success: true,
        message: "Инвентарь обновлен",
        data: updatedInventory,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Ошибка при обновлении инвентаря" });
    }
  }
);

routerUserInventories.get(
  "/inventories-export/:id",
  checkToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const hasAccess = await hasReadAccess(id, req.user.userId);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Инвентарь не найден или нет доступа",
        });
      }

      const inventory = await prisma.inventory.findFirst({
        where: { id },
        include: { items: { include: { tags: true } } },
      });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Инвентарь не найден",
        });
      }

      const fields = [
        { label: "ID", value: "id" },
        { label: "Название", value: "name" },
        { label: "Описание", value: "description" },
        {
          label: "Теги",
          value: (row) => row.tags?.map((tag) => tag.name).join(", ") || "",
        },
        {
          label: "Дата создания",
          value: (row) => new Date(row.createdAt).toLocaleDateString("ru-RU"),
        },
      ];

      const csv = new Parser({ fields, withBOM: true }).parse(
        inventory.items || []
      );

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="inventory-${id}.csv"`
      );
      res.send(csv);
    } catch {
      res.status(500).json({ success: false, message: "Ошибка экспорта" });
    }
  }
);
export default routerUserInventories;
