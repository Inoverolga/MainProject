import { prisma } from "../lib/prisma.js";

export const isInventoryOwner = async (inventoryId, userId) => {
  const inventory = await prisma.inventory.findUnique({
    where: { id: inventoryId },
    select: { userId: true },
  });
  return inventory?.userId === userId;
};

export const canManagersInventory = async (
  inventoryId,
  userId,
  userIsAdmin = false
) => {
  if (userIsAdmin) return true;
  return await isInventoryOwner(inventoryId, userId);
};

export const hasWriteAccess = async (
  inventoryId,
  userId,
  userIsAdmin = false
) => {
  if (userIsAdmin) return true;
  if (!userId) return false;

  const inventory = await prisma.inventory.findUnique({
    where: { id: inventoryId },
    include: {
      inventoryAccesses: {
        where: {
          userId,
          accessLevel: "WRITE",
        },
      },
    },
  });

  if (!inventory) return false;
  if (inventory.userId === userId) return true;
  return inventory.inventoryAccesses.length > 0;
};

export const hasReadAccess = async (
  inventoryId,
  userId,
  userIsAdmin = false
) => {
  if (userIsAdmin) return true;
  if (!inventoryId) return false;

  const inventory = await prisma.inventory.findUnique({
    where: { id: inventoryId },
    include: {
      inventoryAccesses: {
        where: { userId },
      },
    },
  });

  if (!inventory) return false;
  if (inventory.userId === userId) return true;
  if (inventory.isPublic) return true;
  if (!userId) return false;

  return inventory.inventoryAccesses.length > 0;
};

export const getItemWithAccessCheck = async (
  itemId,
  userId,
  requireWrite = false,
  userIsAdmin = false
) => {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { tags: true, inventory: true },
  });

  if (!item) throw new Error("Товар не найден");

  const hasAccess = requireWrite
    ? await hasWriteAccess(item.inventoryId, userId, userIsAdmin)
    : await hasReadAccess(item.inventoryId, userId);

  if (!hasAccess) {
    throw new Error(
      requireWrite ? "Нет прав на запись" : "Нет доступа для просмотра"
    );
  }

  return item;
};
