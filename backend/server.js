import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import chatRoutes from "./routes/chat.js";
import uploadRoutes from "./routes/upload.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Backend is running ");
});

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);
app.use("/upload", uploadRoutes);

app.use((err, req, res, next) => {
  console.error(" ERROR:", err);
  res.status(500).json({ error: err.message });
});

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.log(" DB error:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(` Server running on ${PORT}`);
});