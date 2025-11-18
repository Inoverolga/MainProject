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
      status: "new",
      adminEmails: process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS.split(",")
        : ["admin@example.com"],
    };

    const fileUrl = await uploadToCloud(supportData);

    const supportRequest = await prisma.supportRequest.create({
      data: {
        problem,
        priority,
        reportedBy: userId,
        inventoryId,
        pageUrl,
        fileUrl: fileUrl?.webUrl || null,
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
        fileUrl: fileUrl?.webUrl,
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
routerRequest.get("/list-support", checkToken, checkAdmin, async (req, res) => {
  try {
    const requests = await prisma.supportRequest.findMany({
      include: {
        user: { select: { email: true, name: true } },
        inventory: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: { requests, total: requests.length } });
  } catch (error) {
    handleError(error, res);
  }
});

routerRequest.get("/support-my", checkToken, async (req, res) => {
  try {
    const requests = await prisma.supportRequest.findMany({
      where: { reportedBy: req.user.userId },
      include: { inventory: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: { requests, total: requests.length } });
  } catch (error) {
    handleError(error, res);
  }
});

routerRequest.patch(
  "/support/:requestId/status",
  checkToken,
  checkAdmin,
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status } = req.body;

      if (!["pending", "processed", "resolved"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Статус должен быть: pending, processed или resolved",
        });
      }

      const updatedRequest = await prisma.supportRequest.update({
        where: { id: requestId },
        data: { status },
        include: {
          user: { select: { email: true, name: true } },
          inventory: { select: { name: true } },
        },
      });

      res.json({
        success: true,
        data: updatedRequest,
        message: "Статус запроса обновлен",
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);
export default routerRequest;
