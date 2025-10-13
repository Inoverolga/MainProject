import express from "express";
import cors from "cors";
import routerInventories from "../server/routes/routerInventories.js";
import routerSearch from "./routes/routerSearch.js";

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

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
