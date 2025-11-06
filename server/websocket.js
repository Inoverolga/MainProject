import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { hasWriteAccess, hasReadAccess } from "./utils/accessUtils.js";
import { prisma } from "./lib/prisma.js";

const connections = new Map();

export function initializeWebSocket(server) {
  const websocket = new WebSocketServer({ server, path: "/ws/api/posts" });

  websocket.on("connection", async (ws, req) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const inventoryId = url.searchParams.get("inventoryId");
      const token = url.searchParams.get("token");

      if (!inventoryId) {
        ws.close(1008, "Inventory ID required");
        return;
      }

      // ПРОВЕРЯЕМ ТОКЕН АУТЕНТИФИКАЦИИ
      let userId = null;

      if (token) {
        const user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        userId = user.userId;
      } else {
        console.log("🔓 Нет токена - анонимное подключение");
      }

      //ПРОВЕРЯЕМ СУЩЕСТВОВАНИЕ ИНВЕНТАРЯ

      const inventory = await prisma.inventory.findUnique({
        where: { id: inventoryId },
      });

      if (!inventory) {
        ws.close(1000, "Inventory not found");
        return;
      }

      //ПРОВЕРЯЕМ ПРАВА ДОСТУПА (для неаутентифицированных - только просмотр)
      const hasAccess = userId
        ? await hasReadAccess(inventoryId, userId)
        : inventory.isPublic;
      console.log("📊 Результат проверки доступа:", hasAccess);
      if (!hasAccess) {
        ws.close(1000, "Access denied");
        return;
      }

      //СОХРАНЯЕМ СОЕДИНЕНИЕ
      if (!connections.has(inventoryId)) {
        connections.set(inventoryId, new Set());
      }
      const room = connections.get(inventoryId);
      if (!room) {
        ws.close(1000, "Room creation error");
        return;
      }

      room.add(ws);

      //СОХРАНЯЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ В СОЕДИНЕНИИ
      ws.userId = userId;
      ws.inventoryId = inventoryId;
      ws.hasWriteAccess = userId
        ? await hasWriteAccess(inventoryId, userId)
        : false;

      // ОТПРАВЛЯЕМ ПОДТВЕРЖДЕНИЕ ПОДКЛЮЧЕНИЯ
      const connectedMessage = {
        type: "CONNECTED",
        message: "WebSocket подключен",
        inventoryId: inventoryId,
        userId: userId,
        hasWriteAccess: ws.hasWriteAccess,
      };

      ws.send(JSON.stringify(connectedMessage));

      ws.on("close", () => {
        const room = connections.get(inventoryId);
        if (room) {
          room.delete(ws);
          if (room.size === 0) {
            connections.delete(inventoryId);
          }
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });

      console.log("✅ WebSocket подключение установлено успешно!");
    } catch (error) {
      console.error("❌ Ошибка в WebSocket подключении:", error);
      ws.close(1000, "Connection error");
    }
  });

  return websocket;
}

//функция для рассылки сообщений
export function sendMessageToAllUsers(inventoryId, message) {
  const room = connections.get(inventoryId);
  if (!room) {
    return;
  }
  console.log("📤 Найдена комната с", room.size, "клиентами");

  room.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
}
