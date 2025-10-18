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

export default routerUserInventories;
