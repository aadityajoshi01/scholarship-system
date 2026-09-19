const express = require("express");
const { pool } = require("../db/connection");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, description, income_limit, min_marks, required_documents, is_active FROM schemes WHERE is_active = true ORDER BY name");
    res.json({ schemes: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load schemes" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const { name, description, incomeLimit, minMarks, requiredDocuments = [] } = req.body;
  if (!name) return res.status(400).json({ message: "Scheme name is required" });
  try {
    const result = await pool.query("INSERT INTO schemes (name, description, income_limit, min_marks, required_documents) VALUES ($1, $2, $3, $4, $5) RETURNING *", [name, description || null, incomeLimit || null, minMarks || null, JSON.stringify(requiredDocuments)]);
    res.status(201).json({ scheme: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to create scheme" });
  }
});

module.exports = router;
