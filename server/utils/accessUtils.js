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
    console.log("✅ Access granted: owner");
    return true;
  }
  if (inventory.isPublic) {
    const result = accessLevels.includes("WRITE") ? !!userId : true;
    console.log("🔍 Public inventory check:", { accessLevels, userId, result });
    return result;
  }

  return inventory.inventoryAccesses.length > 0;
};

export const isInventoryOwner = async (inventoryId, userId) => {
  console.log("🔍 [isInventoryOwner] Проверка:", { inventoryId, userId });
  const inventory = await prisma.inventory.findUnique({
    where: { id: inventoryId },
    select: { userId: true },
  });
  console.log("🔍 [isInventoryOwner] Найден инвентарь:", inventory);

  const result = inventory?.userId === userId;
  console.log("🔍 [isInventoryOwner] Результат:", result);

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
  console.log("🔍 Found item:", {
    itemId: item.id,
    inventoryId: item.inventoryId,
    inventoryUserId: item.inventory.userId,
  });
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
