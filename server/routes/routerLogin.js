import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";

const routerLogin = express.Router();

export const checkToken = (req, res, next) => {
  const auth = req.headers["authorization"];
  const token = auth && auth.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Токен отсутствует" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Недействительный токен" });
  }
};

routerLogin.get("/me", checkToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.userId,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error("Ошибка в /me:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

routerLogin.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email и пароль обязательны" });
    }

    const chekUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!chekUser) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const isPasswordValid = await bcrypt.compare(password, chekUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const token = jwt.sign(
      {
        userId: chekUser.id,
        email: chekUser.email,
        //role: user.role
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      user: {
        id: chekUser.id,
        name: chekUser.name,
        email: chekUser.email,
      },
      token,
      message: "Вход выполнен успешно",
    });
  } catch (error) {
    console.error("Ошибка входа:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

export default routerLogin;
