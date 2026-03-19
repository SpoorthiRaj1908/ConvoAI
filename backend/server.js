import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import chatRoutes from "./routes/chat.js";
import uploadRoutes from "./routes/upload.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running ");
});

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);
app.use("/upload", uploadRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log(" Connected to MongoDB");
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
  });

app.listen(PORT, "0.0.0.0", () => {
  console.log(` Server running on port ${PORT}`);
});