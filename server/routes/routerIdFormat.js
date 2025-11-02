import express from "express";
import { prisma } from "../lib/prisma.js";
import { checkToken } from "../middleware/checkToken.js";
import { isInventoryOwner, hasWriteAccess } from "../utils/accessUtils.js";
import { handleError } from "../utils/handleError.js";
import { v4 as uuidv4 } from "uuid";
import { customAlphabet } from "nanoid";
import { format } from "date-fns";

const routerIdFormat = express.Router();

//добавляем нули слева
function formatNumber(number, formatPattern) {
  return number.toString().padStart(formatPattern.length, "0");
}

// функции для sequence
async function getSequenceValue(inventoryId, sequenceKey, increment = false) {
  if (increment) {
    const sequence = await prisma.inventorySequence.upsert({
      where: { inventoryId_sequenceKey: { inventoryId, sequenceKey } },
      update: { value: { increment: 1 } },
      create: { inventoryId, sequenceKey, value: 1 },
    });
    return sequence.value;
  } else {
    const sequence = await prisma.inventorySequence.findUnique({
      where: { inventoryId_sequenceKey: { inventoryId, sequenceKey } },
    });
    return sequence ? sequence.value : 1;
  }
}

// функция генерации ID
export async function generateCustomId(
  customIdFormats,
  inventoryId,
  forRealItem = false
) {
  const sorted = customIdFormats.sort((a, b) => a.position - b.position);

  const generators = {
    fixed: (part) => part.value || (forRealItem ? "" : "TEXT"),
    sequence: async (part) => {
      const sequenceValue = await getSequenceValue(
        inventoryId,
        part.sequenceKey || "default",
        forRealItem
      );
      return part.format
        ? formatNumber(sequenceValue, part.format)
        : sequenceValue.toString();
    },
    datetime: (part) => {
      const now = new Date();
      return part.format ? format(now, part.format) : format(now, "yyyy-MM-dd");
    },
    random6digit: () => customAlphabet("0123456789", 6)(),
    random9digit: () => customAlphabet("0123456789", 9)(),
    random20: () => customAlphabet("0123456789", 7)(),
    random32: () =>
      customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10)(),
    guid: () => uuidv4(),
  };

  const parts = [];
  for (let i = 0; i < sorted.length; i++) {
    const part = sorted[i];
    const generator = generators[part.type];
    const value = generator ? await generator(part) : forRealItem ? "" : "VAL";
    parts.push(value);

    if (part.separator && i < sorted.length - 1) {
      parts.push(part.separator);
    }
  }

  return parts.join("");
}

// эндпоинт получения формата
routerIdFormat.get(
  "/inventories/:inventoryId/custom-id-format",
  async (req, res) => {
    try {
      const inventory = await prisma.inventory.findUnique({
        where: { id: req.params.inventoryId },
      });

      if (!inventory) {
        return res
          .status(404)
          .json({ success: false, message: "Инвентарь не найден" });
      }

      const customIdFormats = await prisma.customIdFormat.findMany({
        where: { inventoryId: req.params.inventoryId },
        orderBy: { position: "asc" },
      });

      res.json({
        success: true,
        data: { inventoryId: req.params.inventoryId, customIdFormats },
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

// эндпоинт обновления формата
routerIdFormat.put(
  "/inventories/:inventoryId/custom-id-format-update",
  checkToken,
  async (req, res) => {
    try {
      const { customIdFormats } = req.body;
      const userId = req.user.userId;

      const isOwner = await isInventoryOwner(req.params.inventoryId, userId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "Только владелец инвентаря может изменять формат ID",
        });
      }

      if (!Array.isArray(customIdFormats)) {
        return res
          .status(400)
          .json({ success: false, message: "Неверный формат данных" });
      }

      // Проверка дубликатов позиций
      const positions = customIdFormats.map((f) => f.position);
      if (new Set(positions).size !== positions.length) {
        return res
          .status(400)
          .json({ success: false, message: "Найдены дублирующиеся позиции" });
      }

      const result = await prisma.$transaction(async (tx) => {
        await tx.customIdFormat.deleteMany({
          where: { inventoryId: req.params.inventoryId },
        });

        const createdFormats = [];
        for (const format of customIdFormats) {
          const created = await tx.customIdFormat.create({
            data: { inventoryId: req.params.inventoryId, ...format },
          });
          createdFormats.push(created);
        }
        return createdFormats;
      });

      res.json({
        success: true,
        data: { inventoryId: req.params.inventoryId, customIdFormats: result },
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

//эндпоинт генерации ID
routerIdFormat.post(
  "/inventories/:inventoryId/generate-id",
  checkToken,
  async (req, res) => {
    try {
      const { customIdFormats, forItem = false } = req.body;
      const userId = req.user.userId;

      const hasAccess = await hasWriteAccess(req.params.inventoryId, userId);
      if (!hasAccess) {
        return res
          .status(403)
          .json({ success: false, message: "Нет прав на генерацию ID" });
      }

      let formatsToUse = customIdFormats;

      // Если форматы не переданы, берем из БД
      if (!formatsToUse) {
        formatsToUse = await prisma.customIdFormat.findMany({
          where: { inventoryId: req.params.inventoryId },
          orderBy: { position: "asc" },
        });
      }

      if (!Array.isArray(formatsToUse) || formatsToUse.length === 0) {
        return res.json({ success: true, data: { customId: null } });
      }

      const customId = await generateCustomId(
        formatsToUse,
        req.params.inventoryId,
        forItem
      );

      res.json({ success: true, data: { customId } });
    } catch (error) {
      handleError(error, res);
    }
  }
);

export default routerIdFormat;
