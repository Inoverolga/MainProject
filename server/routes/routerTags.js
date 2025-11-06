import express from "express";
import { prisma } from "../lib/prisma.js";
import { handleError } from "../utils/handleError.js";

const routerTag = express.Router();

routerTag.get("/autocompletion", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const tags = await prisma.tag.findMany({
      where: {
        name: {
          startsWith: q,
          mode: "insensitive",
        },
      },
      select: { name: true },
      orderBy: { name: "asc" },
      take: 10,
    });

    const tagNames = tags.map((tag) => tag.name);
    res.json(tagNames);
  } catch (error) {
    handleError(error, res);
  }
});

routerTag.get("/", async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });

    const tagNames = tags.map((tag) => tag.name);

    res.json(tagNames);
  } catch (error) {
    handleError(error, res);
  }
});

export default routerTag;
