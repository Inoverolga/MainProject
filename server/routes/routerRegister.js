import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

const routerRegister = express.Router();

routerRegister.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    console.log(newUser);

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    error.code === "P2002"
      ? res.status(400).json({ error: "Почта уже используется" })
      : res.status(500).json({ error: "Ошибка на сервере" });
  }
});

export default routerRegister;
