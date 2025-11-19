import express from "express";
import { prisma } from "../lib/prisma.js";
import { checkToken } from "../middleware/checkToken.js";
import { checkAdmin } from "../middleware/checkAdmin.js";
import { handleError } from "../utils/handleError.js";
import { uploadToOneDrive } from "../utils/integration/cloudStorage.js";

const routerRequest = express.Router();

const uploadToCloud = async (data) => {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    const fileName = `support-request-${data.requestId}.json`;
    const uploadResult = await uploadToOneDrive(fileName, jsonData);
    return uploadResult.webUrl;
  } catch (error) {
    return null;
  }
};

routerRequest.post("/support", checkToken, async (req, res) => {
  try {
    console.log("=== SUPPORT REQUEST START ===");
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("User:", req.user);
    const { problem, priority, inventoryId, pageUrl } = req.body;
    const userId = req.user.userId;

    if (!problem || !priority || !pageUrl) {
      return res.status(400).json({
        success: false,
        message: "Обязательные поля: problem, priority, pageUrl",
      });
    }

    if (!["high", "medium", "low"].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Приоритет должен быть: high, medium или low",
      });
    }

    console.log("✅ Validation passed");

    // Получаем пользователя
    console.log("👤 Fetching user...");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    console.log("✅ User found");
    let inventoryName = null;
    if (inventoryId) {
      const inventory = await prisma.inventory.findUnique({
        where: { id: inventoryId },
        select: { name: true },
      });
      inventoryName = inventory?.name;
    }
    console.log("📄 Preparing support data...");
    const supportData = {
      requestId: `SR-${Date.now()}`,
      reportedBy: {
        userId,
        email: user.email,
        name: user.name || "Unknown User",
      },
      problem,
      priority: getPriorityText(priority),
      pageUrl,
      inventory: inventoryName
        ? {
            id: inventoryId,
            name: inventoryName,
          }
        : null,
      timestamp: new Date().toISOString(),
      status: "pending",
      adminEmails: process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS.split(",")
        : ["admin@example.com"],
    };

    let fileUrl = null;

    try {
      console.log("☁️ Starting cloud upload...");
      fileUrl = await uploadToCloud(supportData);
    } catch (uploadError) {
      console.error("Cloud upload failed:", uploadError);
    }

    console.log("💾 Creating database record...");
    const supportRequest = await prisma.supportRequest.create({
      data: {
        problem,
        priority,
        reportedBy: userId,
        pageUrl,
        fileUrl: fileUrl,
      },
      include: {
        user: { select: { email: true, name: true } },
        inventory: { select: { name: true } },
      },
    });

    console.log("✅ Support request created, ID:", supportRequest.id);
    res.json({
      success: true,
      data: {
        requestId: supportRequest.id,
        fileUrl: fileUrl,
        jsonData: supportData,
        createdAt: supportRequest.createdAt,
      },
      message: "Запрос в поддержку успешно создан",
    });
    console.log("🎉 SUPPORT REQUEST COMPLETED");
  } catch (error) {
    console.error("💥 SUPPORT REQUEST ERROR:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("Code:", error.code);
    console.error("Meta:", error.meta);

    // Детальная обработка Prisma ошибок
    if (error.code === "P2002") {
      console.error("Unique constraint violation");
    }
    if (error.code === "P2003") {
      console.error("Foreign key constraint violation");
    }
    if (error.code === "P2025") {
      console.error("Record not found");
    }
    handleError(error, res);
  }
});

const getPriorityText = (priority) => {
  const priorities = {
    high: "Высокий",
    medium: "Средний",
    low: "Низкий",
  };
  return priorities[priority] || priority;
};

export default routerRequest;
