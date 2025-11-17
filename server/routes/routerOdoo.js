import express from "express";
import { prisma } from "../lib/prisma.js";
import { v4 as uuidv4 } from "uuid";
import { handleError } from "../utils/handleError.js";
import { calculateAggregations } from "../utils/integration/odooAggregations.js";
import { checkToken } from "../middleware/checkToken.js";

const routerOdoo = express.Router();

routerOdoo.get("/:inventoryId/generate-token", checkToken, async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { name } = req.query;

    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
    });

    if (!inventory) {
      return res.status(404).json({
        error: "Инвентарь не найден",
      });
    }

    await prisma.odooInventoryToken.updateMany({
      where: {
        inventoryId: inventoryId,
        isActive: true,
      },
      data: { isActive: false },
    });

    const tokenRecord = await prisma.odooInventoryToken.create({
      data: {
        token: uuidv4(),
        name: name || `Токен для ${inventory.name}`,
        inventoryId: inventoryId,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    res.json({
      success: true,
      api_token: tokenRecord.token,
      token_name: tokenRecord.name,
      inventory_name: inventory.name,
      created_at: tokenRecord.createdAt,
      expires_at: tokenRecord.expiresAt,
      is_new: true,
    });
  } catch (error) {
    handleError(error, res);
  }
});

routerOdoo.patch(
  "/:inventoryId/refresh-token",
  checkToken,
  async (req, res) => {
    try {
      const { inventoryId } = req.params;
      const { name } = req.body;

      const tokenRecord = await prisma.odooInventoryToken.findFirst({
        where: {
          inventoryId: inventoryId,
          isActive: true,
        },
        include: {
          inventory: true,
        },
      });
      if (!tokenRecord) {
        return res.status(404).json({ error: "Токен не найден" });
      }

      const updatedToken = await prisma.odooInventoryToken.update({
        where: { id: tokenRecord.id },
        data: {
          token: uuidv4(),
          name: name || tokenRecord.name,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          lastUsedAt: null,
        },
      });

      res.json({
        success: true,
        api_token: updatedToken.token,
        token_name: updatedToken.name,
        inventory_name: tokenRecord.inventory.name,
        created_at: updatedToken.createdAt,
        expires_at: updatedToken.expiresAt,
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

routerOdoo.get("/:token/aggregateddata", async (req, res) => {
  try {
    const { token } = req.params;

    const tokenRecord = await prisma.odooInventoryToken.findFirst({
      where: {
        token: token,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        inventory: {
          include: {
            items: true,
            fieldConfigs: true,
          },
        },
      },
    });

    if (!tokenRecord) {
      return res.status(404).json({
        error: "Токен не найден",
      });
    }

    await prisma.odooInventoryToken.update({
      where: { id: tokenRecord.id },
      data: { lastUsedAt: new Date() },
    });

    const inventory = tokenRecord.inventory;
    const items = inventory.items;
    const fields = inventory.fieldConfigs
      .filter((config) => config.isVisibleInTable)
      .map((config) => ({
        name: config.name,
        type: config.fieldType,
        description: config.description,
      }));

    const aggregations = calculateAggregations(items, inventory.fieldConfigs);

    res.json({
      inventory: {
        id: inventory.id,
        name: inventory.name,
        description: inventory.description,
        created_at: inventory.createdAt,
        fields: fields,
      },
      aggregations: aggregations,
    });
  } catch (error) {
    handleError(error, res);
  }
});
export default routerOdoo;
