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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    let inventoryName = null;
    if (inventoryId) {
      const inventory = await prisma.inventory.findUnique({
        where: { id: inventoryId },
        select: { name: true },
      });
      inventoryName = inventory?.name;
    }

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
      fileUrl = await uploadToCloud(supportData);
    } catch (uploadError) {
      console.error("Cloud upload failed:", uploadError);
    }

    const supportRequest = await prisma.supportRequest.create({
      data: {
        problem,
        priority,
        reportedBy: userId,
        inventoryId,
        pageUrl,
        fileUrl: fileUrl,
      },
      include: {
        user: { select: { email: true, name: true } },
        inventory: { select: { name: true } },
      },
    });

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
  } catch (error) {
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
