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

const app = express();

//HTTP-сервер
const server = createServer(app);
initializeWebSocket(server);

app.use(
  cors({
    origin: ["https://mainproject-front.onrender.com", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

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
//app.listen(PORT, "0.0.0.0", () => {
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`✅ HTTP Server running on port ${PORT}`);
  console.log(`🔗 REST API: http://localhost:${PORT}/api`);
  console.log(
    `🔗 WebSocket: ws://localhost:${PORT}/ws/api/posts?inventoryId=...`
  );
});
