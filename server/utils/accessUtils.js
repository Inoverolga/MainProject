import { prisma } from "../lib/prisma.js";

const checkAccess = async (inventoryId, userId, accessLevels = []) => {
  const inventory = await prisma.inventory.findUnique({
    where: { id: inventoryId },
    include: {
      inventoryAccesses: {
        where: {
          userId,
          accessLevel: { in: accessLevels },
        },
      },
    },
  });

  if (!inventory) return false;
  if (inventory.userId === userId) {
    return true;
  }
  if (inventory.isPublic) {
    const result = accessLevels.includes("WRITE") ? !!userId : true;

    return result;
  }

  return inventory.inventoryAccesses.length > 0;
};

export const isInventoryOwner = async (inventoryId, userId) => {
  const inventory = await prisma.inventory.findUnique({
    where: { id: inventoryId },
    select: { userId: true },
  });

  const result = inventory?.userId === userId;

  return result;
};

export const hasWriteAccess = async (inventoryId, userId) =>
  checkAccess(inventoryId, userId, ["WRITE"]);

export const hasReadAccess = async (inventoryId, userId) =>
  checkAccess(inventoryId, userId, ["READ", "WRITE"]);

export const getItemWithAccessCheck = async (
  itemId,
  userId,
  requireWrite = false
) => {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { tags: true, inventory: true },
  });

  if (!item) throw new Error("Товар не найден");

  const hasAccess = requireWrite
    ? await hasWriteAccess(item.inventoryId, userId)
    : await hasReadAccess(item.inventoryId, userId);

  if (!hasAccess) {
    throw new Error(
      requireWrite ? "Нет прав на запись" : "Нет доступа для просмотра"
    );
  }

  return item;
};
