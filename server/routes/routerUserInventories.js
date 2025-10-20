import express from "express";
import { prisma } from "../lib/prisma.js";
import { checkToken } from "../middleware/checkToken.js";

const routerUserInventories = express.Router();

routerUserInventories.get("/me/inventories", checkToken, async (req, res) => {
  try {
    const inventoriesOfUser = await prisma.inventory.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: inventoriesOfUser,
    });
  } catch (error) {
    console.error("Error fetching user inventories:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка при загрузке инвентарей",
    });
  }
});

routerUserInventories.get(
  "/me/accessible-inventories",
  checkToken,
  async (req, res) => {
    try {
      const accessibleInventories = await prisma.inventoryAccess.findMany({
        where: {
          userId: req.user.id,
          accessLevel: "WRITE",
        },
        include: {
          inventory: {
            include: {
              _count: {
                select: {
                  items: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          inventory: {
            createdAt: "desc",
          },
        },
      });

      const inventories = accessibleInventories.map((access) => ({
        ...access.inventory,
        accessLevel: access.accessLevel,
      }));

      res.json({
        success: true,
        data: inventories,
      });
    } catch (error) {
      console.error("Error fetching accessible inventories:", error);
      res.status(500).json({
        success: false,
        message: "Ошибка при загрузке доступных инвентарей",
      });
    }
  }
);

//создание инвентаря
routerUserInventories.post(
  "/inventories-create",
  checkToken,
  async (req, res) => {
    try {
      console.log("🔍 Headers:", req.headers);
      console.log("🔍 Полный req.body:", req.body);
      console.log("🔍 User from token:", req.user);
      const {
        name,
        description,
        category,
        tags = [],
        isPublic,
      } = req.body.arg || req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { name: true },
      });

      const categoryRecord = await prisma.category.findFirst({
        where: { name: category },
      });

      if (!categoryRecord) {
        return res.status(400).json({
          success: false,
          message: "Категория не найдена",
        });
      }

      const newInventory = await prisma.inventory.create({
        data: {
          name: name,
          description: description,
          categoryId: categoryRecord.id,
          createdBy: user?.name || "Неизвестный пользователь",
          isPublic: Boolean(isPublic),
          userId: req.user.userId,
          tags: {
            connectOrCreate: tags.map((tagName) => ({
              where: { name: tagName }, // если не нашли (null), то след.строка (создаем)
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
      console.error("Ошибка создания инвенторя:", error);
      res
        .status(500)
        .json({ success: false, message: "Ошибка при создании инвентаря" });
    }
  }
);

export default routerUserInventories;
