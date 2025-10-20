import express from "express";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";

const routerSearch = express.Router();

routerSearch.get("/", async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || "";
    const token = req.headers.authorization?.split(" ")[1];

    let userId = null;
    if (token) {
      try {
        userId = jwt.verify(token, process.env.JWT_SECRET).id;
      } catch (error) {}
    }

    const accessConditions = userId
      ? {
          OR: [
            { isPublic: true },
            { userId: userId },
            {
              inventoryAccess: {
                some: { userId: userId, accessLevel: "WRITE" },
              },
            },
          ],
        }
      : { isPublic: true };

    const results = await prisma.inventory.findMany({
      where: {
        AND: [
          accessConditions,
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              {
                tags: {
                  some: { name: { contains: query, mode: "insensitive" } },
                },
              },
              {
                items: {
                  some: { name: { contains: query, mode: "insensitive" } },
                },
              },
            ],
          },
        ],
      },
      include: {
        user: { select: { name: true, email: true } },
        tags: true,
        category: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(results);
  } catch (error) {
    console.error("Ошибка поиска:", error);
    res.status(500).json({ success: false, message: "Ошибка поиска" });
  }
});

export default routerSearch;

// routerSearch.get("/", async (req, res) => {
//   const querySearch = req.query.q?.toLowerCase() || ""; // получаем параметр ?q=

//   const filtered = await prisma.inventory.findMany({
//     where: {
//       AND: [
//         { isPublic: true },
//         {
//           OR: [
//             { name: { contains: querySearch } },
//             { description: { contains: querySearch } },
//             { createdBy: { contains: querySearch } },
//           ],
//         },
//       ],
//     },
//   });

//   res.json(filtered);
// });
