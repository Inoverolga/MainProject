import express from "express";
import { prisma } from "../lib/prisma.js";
import sgMail from "@sendgrid/mail";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

const routerAuthMagic = express.Router();

console.log("🔑 SendGrid API Key exists:", !!process.env.SENDGRID_API_KEY);
console.log(
  "🔑 Key starts with:",
  process.env.SENDGRID_API_KEY?.substring(0, 10) + "..."
);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

routerAuthMagic.post("/magic", async (req, res) => {
  try {
    const { email, name, password: userPassword, isRegistration } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    console.log("📨 Magic link request:", {
      email: normalizedEmail,
      isRegistration,
      name: name ? `${name.substring(0, 10)}...` : "none",
    });

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

    console.log("🔗 MAGIC LINK FOR TESTING:", magicLink);

    const msg = {
      to: normalizedEmail,
      from: {
        email: "2021proekt2021@mail.ru",
        name: "Inventory",
      },
      subject: isRegistration ? "Подтверждение регистрации" : "Вход в систему",
      html: `
        <h2>${isRegistration ? "Завершение регистрации" : "Вход в систему"}</h2>
        <p>Нажмите на ссылку ниже:</p>
        <a href="${magicLink}" style="padding: 10px 20px; background: blue; color: white; text-decoration: none;">
          ${isRegistration ? "Завершить регистрацию" : "Войти"}
        </a>
        <p>Ссылка действительна 15 минут</p>
      `,
    };

    console.log("📧 Attempting to send email via SendGrid...", {
      to: msg.to,
      from: msg.from.email,
      subject: msg.subject,
    });

    try {
      const result = await sgMail.send(msg);

      console.log("✅ SendGrid response:", {
        statusCode: result[0]?.statusCode,
        headers: result[0]?.headers,
        messageId: result[0]?.headers?.["x-message-id"],
      });

      res.json({
        success: true,
        message: "Ссылка отправлена",
        debugLink:
          process.env.NODE_ENV === "development" ? magicLink : undefined,
      });

      // res.json({ success: true, message: "Ссылка отправлена" });
    } catch (emailError) {
      console.error("SendGrid error:", emailError);

      if (emailError.response) {
        console.error("SendGrid response error:", emailError.response.body);
      }
      throw new Error("Ошибка отправки email");
    }
  } catch (error) {
    console.error("Magic link error:", error);
    res.status(500).json({ error: "Ошибка отправки" });
  }
});

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
         localStorage.setItem('user', JSON.stringify({
         id: '${user.id}',
         email: '${user.email}',
         name: '${user.name}',
         isAdmin: ${user.isAdmin}
          }));
          window.location.href = '${FRONTEND_URL}/profile';
        </script>
      </html>
    `);
  } catch (error) {
    console.error("Magic verify error:", error);
    res.status(400).json({ error: "Ошибка верификации" });
  }
});

export default routerAuthMagic;
