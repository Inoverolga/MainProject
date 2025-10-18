import express from "express";
import { prisma } from "../lib/prisma.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { baseURL } from "../config/passport.js";
import bcryptjs from "bcryptjs";

const routerAuthMagic = express.Router();

const FRONTEND_URL = "http://localhost:3000" || process.env.FRONTEND_URL;

routerAuthMagic.post("/magic", async (req, res) => {
  try {
    const { email, name, password: userPassword, isRegistration } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    if (isRegistration) {
      const checkUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (checkUser) {
        return res.status(400).json({
          error: "Пользователь с таким email уже существует",
        });
      }
    }

    const tokenData = isRegistration
      ? {
          email: normalizedEmail,
          name,
          userPassword: userPassword,
          isRegistration: true,
        }
      : {
          email: normalizedEmail,
          isRegistration: false,
        };

    const token = jwt.sign(tokenData, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });

    const magicLink = `${baseURL}/api/auth/magic/verify?token=${token}`;

    await nodemailer
      .createTransport({
        host: "smtp.mail.ru",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      })
      .sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: isRegistration
          ? "Подтверждение регистрации"
          : "Вход в систему",
        html: `<a href="${magicLink}">Войти</a>`,
      });

    res.json({ success: true, message: "Ссылка отправлена" });
  } catch (error) {
    console.error("Magic link error:", error);
    res.status(500).json({ error: "Ошибка отправки" });
  }
});

// Верификация Magic Link
routerAuthMagic.get("/magic/verify", async (req, res) => {
  try {
    if (!req.query.token) {
      return res.status(400).json({ error: "Отсутствует токен" });
    }

    const tokenData = jwt.verify(
      req.query.token,
      process.env.JWT_ACCESS_SECRET
    );

    const { email, name, userPassword, isRegistration } = tokenData;
    const normalizedEmail = email.toLowerCase().trim();

    let user;

    if (isRegistration) {
      //  const bcryptjs = await import("bcryptjs");
      // const actualPassword = userPassword || "default_password_123";
      const actualPassword = userPassword;
      const hashedPassword = await bcryptjs.hash(actualPassword, 12);

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name,
          password: hashedPassword,
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return res.status(400).send(`
          <html>
            <body>
              <p>Пользователь не найден. <a href="http://localhost:3000/auth/register">Зарегистрируйтесь</a></p>
            </body>
          </html>
        `);
      }
    }

    const authToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "7d" }
    );

    res.send(`
      <html>
        <script>
          localStorage.setItem('accessToken', '${authToken}');
          localStorage.setItem('user', '${JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
          })}');
          window.location.href = '${FRONTEND_URL}';
        </script>
      </html>
    `);
  } catch (error) {
    console.error("Magic verify error:", error);
    res.status(400).json({ error: "Ошибка верификации" });
  }
});

export default routerAuthMagic;
