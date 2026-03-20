import express from "express";
import multer from "multer";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { setDocumentText } from "../utils/documentstore.js";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
});

router.post("/", upload.single("file"), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const dataBuffer = req.file.buffer;

    const pdfData = await pdf(dataBuffer);

    const text = pdfData.text;

    setDocumentText(text);

    console.log(" PDF loaded successfully");
    console.log(" Extracted text length:", text.length);

    return res.json({
      message: "PDF uploaded successfully",
      textLength: text.length
    });

  } catch (err) {

    console.error(" PDF processing error:", err);

    return res.status(500).json({
      error: "PDF processing failed"
    });

  }
});

export default router;