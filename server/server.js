import express from "express";
import cors from "cors";
import routerInventories from "../server/routes/routerInventories.js";
import routerSearch from "./routes/routerSearch.js";
import routerTag from "./routes/routerTags.js";
import routerLogin from "./routes/routerLogin.js";
import routerAuthO from "./routes/routerAuthO.js";
import routerAuthMagic from "./routes/routerAuthMagic.js";

const app = express();
app.use(
  cors({
    origin: ["https://mainproject-front.onrender.com", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
