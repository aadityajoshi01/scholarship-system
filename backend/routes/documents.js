const express = require("express");
const upload = require("../middleware/upload");
const { pool } = require("../db/connection");
const { processDocument } = require("../services/aiClient");

const router = express.Router();

router.post("/:applicationId/upload", upload.single("document"), async (req, res) => {
  const { applicationId } = req.params;
  const { documentType } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const docResult = await pool.query(
      `INSERT INTO documents
       (application_id, document_type, original_filename, stored_filename, file_path, verification_status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [applicationId, documentType, file.originalname, file.filename, file.path]
    );

    const aiResult = await processDocument({
      filePath: file.path,
      documentType,
      applicationId
    });

    const documentId = docResult.rows[0].id;

    await pool.query(
      `UPDATE documents
       SET extracted_text = $1,
           ocr_confidence = $2,
           ai_generated_probability = $3,
           verification_status = $4
       WHERE id = $5`,
      [
        aiResult.ocr?.text || "",
        aiResult.ocr?.confidence || 0,
        aiResult.imageAnalysis?.aiGeneratedProbability || 0,
        aiResult.recommendedAction || "manual_review",
        documentId
      ]
    );

    res.json({
      message: "Document uploaded and processed successfully",
      document: docResult.rows[0],
      aiResult
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Document processing failed",
      error: error.message
    });
  }
});

module.exports = router;
