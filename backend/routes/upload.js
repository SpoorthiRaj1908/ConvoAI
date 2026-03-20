import express from "express";
import multer from "multer";
import pdf from "pdf-parse";
import { setDocumentText } from "../utils/documentstore.js";

const router = express.Router();


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, 
});


router.post("/", upload.single("file"), async (req, res) => {
  try {
    console.log(" Upload route hit");

    if (!req.file) {
      console.log(" No file received");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(" File:", req.file.originalname);
    console.log(" Size:", req.file.size);
    console.log(" Type:", req.file.mimetype);

    if (!req.file.mimetype.includes("pdf")) {
      console.log(" Invalid file type:", req.file.mimetype);
      return res.status(400).json({ error: "Only PDF files allowed" });
    }

    console.log(" Parsing PDF...");
    const pdfData = await pdf(req.file.buffer);
    console.log(" PDF parsed successfully");

    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      console.log(" Empty PDF text");
      return res.status(400).json({ error: "PDF has no readable text" });
    }

    setDocumentText(text);

    console.log(" Text length:", text.length);

    return res.status(200).json({
      message: "PDF uploaded successfully",
      textLength: text.length,
    });

  } catch (err) {
    console.error(" PDF processing error:", err);

    return res.status(500).json({
      error: "PDF processing failed",
      details: err.message,
    });
  }
});

export default router;