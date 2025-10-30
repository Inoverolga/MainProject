import express from "express";
import { prisma } from "../lib/prisma.js";
import { checkToken } from "../middleware/checkToken.js";
import { handleError } from "../utils/handleError.js";
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

export const inventorySelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  isPublic: true,
  version: true,
  _count: { select: { items: true } },
};

routerUserInventories.get("/me/inventories", checkToken, async (req, res) => {
  try {
    const inventories = await prisma.inventory.findMany({
      where: { userId: req.user.userId },
      select: inventorySelect,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: inventories });
  } catch (error) {
    handleError(error, res);
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
            select: {
              ...inventorySelect,
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
      handleError(error, res);
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

      // Используем готовую функцию проверки доступа
      const hasAccess = await hasReadAccess(id, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Нет доступа к инвентарю",
        });
      }

      const inventoryItem = await prisma.inventory.findUnique({
        where: { id },
        select: {
          ...inventorySelect,
          user: { select: { name: true, email: true, id: true } },
          category: true,
          tags: true,
          //  version: true,
          items: {
            include: { tags: true },
            orderBy: { createdAt: "desc" },
          },
          // _count: { select: { items: true } },
        },
      });

      if (!inventoryItem) {
        return res
          .status(404)
          .json({ success: false, message: "Инвентарь не найден" });
      }

      const canWrite = await hasWriteAccess(id, userId);

      res.json({
        success: true,
        message: "Инвентарь загружен",
        data: { ...inventoryItem, canWrite },
      });
    } catch (error) {
      handleError(error, res);
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
      handleError(error, res);
    }
  }
);

//удаление инвентаря
routerUserInventories.delete(
  "/inventories-delete/:id",
  checkToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { version } = req.query;

      if (!version) {
        return res.status(400).json({
          success: false,
          message: "Версия обязательна",
        });
      }

      const hasAccess = await hasWriteAccess(id, req.user.userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Нет прав для удаления инвентаря",
        });
      }

      await prisma.inventory.delete({
        where: {
          id: id,
          version: parseInt(version),
        },
      });

      res.json({ success: true, message: "Инвентарь удален" });
    } catch (error) {
      handleError(error, res);
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
          version: true,
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
      handleError(error, res);
    }
  }
);

routerUserInventories.put(
  "/inventories-update/:id",
  checkToken,
  async (req, res) => {
    try {
      const {
        name,
        description,
        category,
        tags = [],
        isPublic,
        version,
      } = req.body.arg || req.body;

      if (!version) {
        return res.status(400).json({
          success: false,
        });
      }

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
        where: { id: req.params.id, version: parseInt(version) },
        data: {
          name: name.trim(),
          description: description.trim(),
          categoryId,
          isPublic: Boolean(isPublic),
          version: { increment: 1 },
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
      handleError(error, res);
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
    } catch (error) {
      handleError(error, res);
    }
  }
);
export default routerUserInventories;
