import express from "express";
import { prisma } from "../lib/prisma.js";
import { Resend } from "resend";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { handleError } from "../utils/handleError.js";

const routerAuthMagic = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const sendMagicLinkEmail = async (email, token, isRegistration) => {
  const magicLink = `${BACKEND_URL}/api/auth/magic/verify?token=${token}`;

  const { error } = await resend.emails.send({
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

  if (error) throw new Error("Ошибка отправки email");
};

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

    await sendMagicLinkEmail(email, token, isRegistration);

    res.json({ success: true, message: "Ссылка отправлена" });
  } catch (error) {
    handleError(error, res);
  }
});

routerAuthMagic.get("/magic/verify", async (req, res) => {
  try {
    if (!req.query.token) {
      throw new Error("Отсутствует токен");
    }

    const tokenData = jwt.verify(
      req.query.token,
      process.env.JWT_ACCESS_SECRET
    );

    const { email, name, userPassword, isRegistration } = tokenData;
    const normalizedEmail = email.toLowerCase().trim();

    let user;

    if (isRegistration) {
      const hashedPassword = await bcryptjs.hash(userPassword, 12);
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
      { userId: user.id, isAdmin: user.isAdmin },
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
            isAdmin: user.isAdmin,
          })}');
          window.location.href = '${FRONTEND_URL}/profile';
        </script>
      </html>
    `);
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(400).send(`
        <html>
          <body>
            <p>Неверная ссылка. <a href="${FRONTEND_URL}/auth/login">Попробуйте снова</a></p>
          </body>
        </html>
      `);
    }
    handleError(error, res);
  }
});

export default routerAuthMagic;
