import express from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { baseURL } from "../config/passport.js";
import { prisma } from "../lib/prisma.js";

const routerAuthO = express.Router();

const createAuthResponse = (req, res) => {
  const { authError, user } = req;

  const messageData = authError
    ? { type: "OAUTH_ERROR", error: authError.message }
    : {
        type: "OAUTH_SUCCESS",
        token: jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, {
          expiresIn: "7d",
        }),
        user: JSON.stringify(user),
      };

  res.send(`
    <html>
      <script>
        window.opener.postMessage(${JSON.stringify(messageData)}, '*');
        window.close();
      </script>
    </html>
  `);
};

// Google OAuth
routerAuthO.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

routerAuthO.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (error, user) => {
      req.authError = error || null;
      req.user = user || null;
      next();
    })(req, res, next);
  },
  createAuthResponse
);

// Facebook OAuth
routerAuthO.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  })
);

routerAuthO.get(
  "/facebook/callback",
  (req, res, next) => {
    passport.authenticate("facebook", { session: false }, (error, user) => {
      req.authError = error || null; // ← Записываем в req
      req.user = user || null; // ← Записываем в req
      next(); // ← Передаем в createAuthResponse
    })(req, res, next); // ← Вызываем passport с теми же параметрами
  },
  createAuthResponse
);

// Magic Link
routerAuthO.post("/magic", async (req, res) => {
  try {
    const { email, name, password: userPassword, isRegistration } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    if (isRegistration) {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
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
routerAuthO.get("/magic/verify", async (req, res) => {
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
      const bcrypt = await import("bcrypt");
      const actualPassword = userPassword || "default_password_123";
      const hashedPassword = await bcrypt.hash(actualPassword, 12);

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name || normalizedEmail.split("@")[0],
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
          window.location.href = 'http://localhost:3000';
        </script>
        <body>
          <p>${
            isRegistration ? "Регистрация завершена" : "Вход выполнен"
          }. Перенаправление...</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Magic verify error:", error);
    res.status(400).json({ error: "Ошибка верификации" });
  }
});

export default routerAuthO;
