import { prisma } from "../lib/prisma.js";

//Проверяет является ли пользователь владельцем инвентаря
export const isInventoryOwner = async (inventoryId, userId) => {
  const inventory = await prisma.inventory.findFirst({
    where: { id: inventoryId, userId },
  });
  return !!inventory;
};

// Проверяет имеет ли пользователь доступ на запись к инвентарю
export const hasWriteAccess = async (inventoryId, userId) => {
  const inventory = await prisma.inventory.findFirst({
    where: {
      id: inventoryId,
      OR: [
        { userId },
        {
          inventoryAccesses: {
            some: { userId, accessLevel: "WRITE" },
          },
        },
      ],
    },
  });
  return !!inventory;
};

// Проверяет имеет ли пользователь доступ на чтение к инвентарю

export const hasReadAccess = async (inventoryId, userId) => {
  const inventory = await prisma.inventory.findFirst({
    where: {
      id: inventoryId,
      OR: [
        { userId },
        {
          inventoryAccesses: {
            some: { userId, accessLevel: { in: ["READ", "WRITE"] } },
          },
        },
      ],
    },
  });
  return !!inventory;
};

export const getItemWithAccessCheck = async (
  itemId,
  userId,
  requireWrite = false
) => {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      tags: true,
      inventory: { select: { id: true, userId: true, isPublic: true } },
    },
  });

  if (!item) throw new Error("Товар не найден");

  const hasAccess = requireWrite
    ? await hasWriteAccess(item.inventoryId, userId)
    : await hasReadAccess(item.inventoryId, userId);

  if (!hasAccess) {
    throw new Error(requireWrite ? "Нет прав на запись" : "Нет доступа");
  }

  return item;
};
