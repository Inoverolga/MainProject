import express from "express";
import { prisma } from "../lib/prisma.js";
import { checkToken } from "../middleware/checkToken.js";
import { handleError } from "../utils/handleError.js";
import { Parser } from "json2csv";
import {
  hasWriteAccess,
  hasReadAccess,
  canManagersInventory,
} from "../utils/accessUtils.js";
import { fieldsItemSelect } from "./routerUserItem.js";

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
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
  isPublic: true,
  version: true,
  userId: true,
  _count: { select: { items: true } },
};

const inventoryInclude = {
  user: { select: { name: true, email: true } },
  tags: true,
  category: true,
  _count: { select: { items: true } },
};

routerUserInventories.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    handleError(error, res);
  }
});

routerUserInventories.get("/me/inventories", checkToken, async (req, res) => {
  try {
    const query = req.query.q?.trim() || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {
      userId: req.user.userId,
      ...(query && {
        name: { startsWith: query, mode: "insensitive" },
      }),
    };

    const inventories = await prisma.inventory.findMany({
      where,
      include: inventoryInclude,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    inventories.forEach((inv) => console.log("    -", inv.name));

    const total = await prisma.inventory.count({ where });

    res.json({
      success: true,
      data: inventories,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    handleError(error, res);
  }
});

routerUserInventories.get(
  "/me/accessible-inventories",
  checkToken,
  async (req, res) => {
    try {
      const query = req.query.q?.trim() || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const where = {
        inventoryAccesses: {
          some: {
            userId: req.user.userId,
            OR: [{ accessLevel: "WRITE" }, { accessLevel: "READ" }],
          },
        },
        userId: { not: req.user.userId },
        ...(query && {
          name: { startsWith: query, mode: "insensitive" },
        }),
      };

      const accessible = await prisma.inventory.findMany({
        where,
        include: {
          ...inventoryInclude,
          inventoryAccesses: {
            where: { userId: req.user.userId },
            select: { accessLevel: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      const inventoriesWithAccess = accessible.map((inv) => ({
        ...inv,
        accessLevel: inv.inventoryAccesses[0]?.accessLevel || "READ",
      }));

      const total = await prisma.inventory.count({ where });

      res.json({
        success: true,
        data: inventoriesWithAccess,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

routerUserInventories.get(
  "/inventories/:id/items-with-access",
  checkToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

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
          userId: true,
          user: { select: { name: true, email: true, id: true } },
          category: true,
          tags: true,
          items: {
            select: fieldsItemSelect,
            orderBy: { createdAt: "desc" },
          },
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
        imageUrl,
        ...rest
      } = req.body.arg || req.body;

      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Название обязательно",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { name: true },
      });

      const categoryId = await findCategoryId(category);
      const newInventory = await prisma.inventory.create({
        data: {
          name,
          description,
          imageUrl: imageUrl || null,
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
        include: {
          category: true,
          tags: true,
        },
      });

      res.json({
        success: true,
        message: "Инвентарь успешно создан!",
        data: newInventory,
      });
    } catch (error) {
      console.error("❌ Ошибка в catch:", error);
      handleError(error, res);
    }
  }
);

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

      const canAccess = await canManagersInventory(
        id,
        req.user.userId,
        req.user.isAdmin
      );
      if (!canAccess) {
        return res.status(403).json({
          success: false,
          message: "Только владелец или администратор может удалять инвентарь",
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

routerUserInventories.get(
  "/inventories-edit/:id",
  checkToken,
  async (req, res) => {
    try {
      const canAccess = await canManagersInventory(
        req.params.id,
        req.user.userId,
        req.user.isAdmin
      );

      if (!canAccess) {
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
          imageUrl: true,
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
        imageUrl,
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

      const canEdit = await canManagersInventory(
        req.params.id,
        req.user.userId,
        req.user.isAdmin
      );

      if (!canEdit) {
        return res.status(403).json({
          success: false,
          message:
            "Только владелец или администратор может редактировать инвентарь",
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
          imageUrl: imageUrl || null,
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

routerUserInventories.get("/debug/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await prisma.inventory.findUnique({
      where: { id },
    });

    res.json({ exists: !!inventory, inventory });
  } catch (error) {
    handleError(error, res);
  }
});
export default routerUserInventories;
