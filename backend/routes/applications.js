const express = require("express");
const { pool } = require("../db/connection");

const router = express.Router();

router.post("/", async (req, res) => {
  const { applicantId, schemeId, formData } = req.body;

  try {
    const applicationNumber = `APP-${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO applications (application_number, applicant_id, scheme_id, status, submitted_at)
       VALUES ($1, $2, $3, 'draft', NOW())
       RETURNING *`,
      [applicationNumber, applicantId, schemeId]
    );

    res.status(201).json({ application: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM applications ORDER BY created_at DESC");
    res.json({ applications: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
