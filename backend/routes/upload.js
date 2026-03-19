import express from "express";
import multer from "multer";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { setDocumentText } from "../utils/documentstore.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const dataBuffer = fs.readFileSync(req.file.path);

    const pdfData = await pdf(dataBuffer);

    const text = pdfData.text;

    setDocumentText(text);

    console.log("PDF loaded successfully");
    console.log("Extracted text length:", text.length);

    res.json({
      message: "PDF uploaded successfully",
      textLength: text.length
    });

  } catch (err) {

    console.error("PDF processing error:", err);

    res.status(500).json({
      error: "PDF processing failed"
    });

  }

});

export default router;