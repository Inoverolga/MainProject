import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

const routerRegister = express.Router();

//const usersInMemory = [];

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

    //     const newUser = {
    //       id: Date.now(),
    //       name: name,
    //       email: email,
    //       password: hashedPassword,
    //     };

    //  usersInMemory.push(newUser);
    console.log(newUser);

    //     const responseNewUser = {
    //       id: newUser.id,
    //       name: newUser.name,
    //       email: newUser.email,
    //     };
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    error.code === "P2002"
      ? res.status(400).json({ error: "Почта уже используется" })
      : res.status(500).json({ error: "Ошибка на сервере" });
  }
});

export default routerRegister;
