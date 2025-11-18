import dotenv from "dotenv";

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { initializeWebSocket } from "./websocket.js";
import { prisma } from "./lib/prisma.js";
import routerInventories from "./routes/routerInventoriesPublic.js";
import routerSearch from "./routes/routerSearch.js";
import routerTag from "./routes/routerTags.js";
import routerLogin from "./routes/routerLogin.js";
import routerAuthO from "./routes/routerAuthO.js";
import routerAuthMagic from "./routes/routerAuthMagic.js";
import routerUserInventories from "./routes/routerUserInventories.js";
import routerUserItem from "./routes/routerUserItem.js";
import routerCustomFields from "./routes/routerCustomFields.js";
import routerAccessUser from "./routes/routerAccessUsers.js";
import routerPosts from "./routes/routerPosts.js";
import routerLikes from "./routes/routerLikes.js";
import routerIdFormat from "./routes/routerIdFormat.js";
import routerAdmin from "./routes/routerAdmin.js";
import routerStats from "./routes/routerStats.js";
import routerImg from "./routes/routerImg.js";
import routerSalesforce from "./routes/routerSalesforce.js";
import routerOdoo from "./routes/routerOdoo.js";
import routerOdooImport from "./routes/routerOdooImport.js";
import routerRequest from "./routes/routerRequest.js";

dotenv.config();
const app = express();

const server = createServer(app);
initializeWebSocket(server);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(
  cors({
    origin: ["https://mainproject-front.onrender.com", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.get("/ping", (req, res) => {
  console.log("🔄 Keep-alive ping received");
  res.json({
    status: "alive",
    timestamp: new Date().toISOString(),
    service: "mainproject-backend",
    uptime: process.uptime(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: "connected",
    environment: process.env.NODE_ENV || "development",
  });
});

server.timeout = 300000;
server.keepAliveTimeout = 120000;

app.use("/api/inventories", routerInventories);
app.use("/api/search", routerSearch);
app.use("/api/tags", routerTag);
app.use("/api/auth", routerLogin);
app.use("/api/auth", routerAuthO);
app.use("/api/auth", routerAuthMagic);
app.use("/api/users", routerUserInventories);
app.use("/api/users", routerUserItem);
app.use("/api/users", routerCustomFields);
app.use("/api/access/user", routerAccessUser);
app.use("/api/posts", routerPosts);
app.use("/api/likes", routerLikes);
app.use("/api/idFormat", routerIdFormat);
app.use("/api/admin", routerAdmin);
app.use("/api/stats", routerStats);
app.use("/api/img", routerImg);

app.use("/api/salesforce", routerSalesforce);
app.use("/api/odoo", routerOdoo);
app.use("/api/odoo/import", routerOdooImport);
app.use("/api/request", routerRequest);

setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database keep-alive ping");
  } catch (error) {
    console.log("❌ Database ping failed:", error.message);
  }
}, 4 * 60 * 1000);

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    res.json({
      success: true,
      message: "База данных подключена!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3001;

if (process.env.SALESFORCE_CLIENT_ID) {
  console.log("🔧 Salesforce: Checking configuration...");
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`✅ HTTP Server running on port ${PORT}`);
  console.log(`🔗 REST API: http://localhost:${PORT}/api`);
  console.log(
    `🔗 WebSocket: ws://localhost:${PORT}/ws/api/posts?inventoryId=...`
  );
});
