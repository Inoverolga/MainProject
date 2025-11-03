import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

async function main() {
  // Один запрос для всех items
  await prisma.$executeRaw`
    UPDATE items
    SET "customId" = 'temp_' || id
    WHERE "customId" IS NULL
  `;
  console.log("✅ Все customId заполнены");
}

main();
