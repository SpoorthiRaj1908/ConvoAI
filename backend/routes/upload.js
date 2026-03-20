import express from "express";
import multer from "multer";
import pdf from "pdf-parse";
import { setDocumentText } from "../utils/documentstore.js";

const router = express.Router();


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, 
});


router.post("/", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    try {
      console.log(" Upload route hit");

      if (err) {
        console.error(" Multer error:", err);
        return res.status(400).json({
          error: "File upload error",
          details: err.message,
        });
      }

      if (!req.file) {
        console.log(" No file received");
        return res.status(400).json({ error: "No file uploaded" });
      }

      console.log(" File:", req.file.originalname);
      console.log(" Size:", req.file.size);
      console.log(" Type:", req.file.mimetype);

    
      if (!req.file.mimetype.includes("pdf")) {
        return res.status(400).json({
          error: "Only PDF files allowed",
        });
      }

    
      let text = "";

      try {
        console.log(" Parsing PDF...");
        const pdfData = await pdf(req.file.buffer);
        text = pdfData.text;
        console.log(" PDF parsed successfully");
      } catch (parseErr) {
        console.error(" PDF parse failed:", parseErr);
        return res.status(500).json({
          error: "PDF parsing failed",
          details: parseErr.message,
        });
      }

      
      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          error: "PDF has no readable text",
        });
      }

   
      setDocumentText(text);

      console.log(" Text length:", text.length);

      return res.status(200).json({
        message: "PDF uploaded successfully",
        textLength: text.length,
      });

    } catch (err) {
      console.error(" Upload route crash:", err);

      return res.status(500).json({
        error: "Unexpected server error",
        details: err.message,
        stack: err.stack,
      });
    }
  });
});

export default router;