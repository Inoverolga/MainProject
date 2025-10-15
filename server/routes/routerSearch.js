import express from "express";
import { prisma } from "../lib/prisma.js";

const routerSearch = express.Router();

routerSearch.get("/", async (req, res) => {
  const querySearch = req.query.q?.toLowerCase() || ""; // получаем параметр ?q=

  const filtered = await prisma.inventory.findMany({
    where: {
      AND: [
        { isPublic: true },
        {
          OR: [
            { name: { contains: querySearch } },
            { description: { contains: querySearch } },
            { createdBy: { contains: querySearch } },
          ],
        },
      ],
    },
  });

  res.json(filtered);
});

export default routerSearch;
