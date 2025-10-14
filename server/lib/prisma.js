// import pkg from "@prisma/client";
// const { PrismaClient } = pkg;

// export const prisma = new PrismaClient();

export const prisma = {
  $queryRaw: async (query) => {
    console.log("Mock Prisma query:", query);
    return [{ current_time: new Date().toISOString() }];
  },
};
