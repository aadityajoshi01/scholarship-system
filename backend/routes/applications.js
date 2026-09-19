const express = require("express");
const { pool } = require("../db/connection");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const { schemeId, formData = {} } = req.body;
  if (!schemeId) return res.status(400).json({ message: "schemeId is required" });
  try {
    const applicationNumber = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const result = await pool.query(`INSERT INTO applications (application_number, applicant_id, scheme_id, status, form_data) VALUES ($1, $2, $3, 'submitted', $4) RETURNING *`, [applicationNumber, req.user.userId, schemeId, JSON.stringify(formData)]);
    res.status(201).json({ application: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to create application" });
  }
});

router.get("/mine", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`SELECT a.*, s.name AS scheme_name FROM applications a LEFT JOIN schemes s ON s.id = a.scheme_id WHERE a.applicant_id = $1 ORDER BY a.created_at DESC`, [req.user.userId]);
    res.json({ applications: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load applications" });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`SELECT a.*, s.name AS scheme_name, u.name AS applicant_name, u.email AS applicant_email FROM applications a LEFT JOIN schemes s ON s.id = a.scheme_id LEFT JOIN users u ON u.id = a.applicant_id ORDER BY a.created_at DESC`);
    res.json({ applications: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load applications" });
  }
});

module.exports = router;
