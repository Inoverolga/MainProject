import express from "express";
import { prisma } from "../lib/prisma.js";
import { Resend } from "resend";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

const routerAuthMagic = express.Router();

if (!process.env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY is missing");
}
if (!process.env.JWT_ACCESS_SECRET) {
  console.error("❌ JWT_ACCESS_SECRET is missing");
}

const resend = new Resend(process.env.RESEND_API_KEY);
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

routerAuthMagic.post("/magic", async (req, res) => {
  try {
    console.log("📨 Received magic link request:", req.body);
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

    const magicLink = `${BACKEND_URL}/api/auth/magic/verify?token=${token}`;
    console.log("🔗 Generated magic link for:", normalizedEmail);

    // ✅ ОТПРАВКА ЧЕРЕЗ RESEND

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: isRegistration ? "Подтверждение регистрации" : "Вход в систему",
      html: `
        <h2>${isRegistration ? "Завершение регистрации" : "Вход в систему"}</h2>
        <p>Нажмите на ссылку ниже:</p>
        <a href="${magicLink}" style="padding: 10px 20px; background: blue; color: white; text-decoration: none;">
          ${isRegistration ? "Завершить регистрацию" : "Войти"}
        </a>
        <p>Ссылка действительна 15 минут</p>
      `,
    });
    console.log("📧 Resend Response:", { data, error });
    if (error) {
      console.error("Resend error:", error);
      throw new Error("Ошибка отправки email");
    }
    res.json({ success: true, message: "Ссылка отправлена" });
  } catch (error) {
    console.error("Magic link error:", error);
    res.status(500).json({ error: "Ошибка отправки" });
  }
});

// Верификация Magic Link
routerAuthMagic.get("/magic/verify", async (req, res) => {
  try {
    console.log("🔍 Verifying magic link token");
    if (!req.query.token) {
      return res.status(400).json({ error: "Отсутствует токен" });
    }

    const tokenData = jwt.verify(
      req.query.token,
      process.env.JWT_ACCESS_SECRET
    );

    console.log("✅ Token verified:", tokenData);
    const { email, name, userPassword, isRegistration } = tokenData;
    const normalizedEmail = email.toLowerCase().trim();

    let user;

    if (isRegistration) {
      const actualPassword = userPassword;
      const hashedPassword = await bcryptjs.hash(actualPassword, 12);

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name,
          password: hashedPassword,
        },
      });
      console.log("✅ New user created:", user.id);
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
      console.log("✅ User found:", user.id);
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
          window.location.href = '${FRONTEND_URL}/profile';
        </script>
      </html>
    `);
  } catch (error) {
    console.error("Magic verify error:", error);
    res.status(400).json({ error: "Ошибка верификации" });
  }
});

// Добавьте в routerAuthMagic.js
routerAuthMagic.get("/magic/status", (req, res) => {
  res.json({
    status: "active",
    resend_configured: !!process.env.RESEND_API_KEY,
    jwt_configured: !!process.env.JWT_ACCESS_SECRET,
    backend_url: process.env.BACKEND_URL,
    frontend_url: process.env.FRONTEND_URL,
    timestamp: new Date().toISOString(),
  });
});
export default routerAuthMagic;
