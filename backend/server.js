const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const authRoutes = require("./routes/auth");
const applicationRoutes = require("./routes/applications");
const documentRoutes = require("./routes/documents");
const schemeRoutes = require("./routes/schemes");
const { pool } = require("./db/connection");

const app = express();
const PORT = Number(process.env.PORT || 5000);
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/health", async (req, res) => {
  let database = "unavailable";
  try { await pool.query("SELECT 1"); database = "connected"; } catch {}
  res.json({ service: "scholarship-backend", status: "ok", database });
});
app.use("/api/auth", authRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/documents", documentRoutes);
app.use((error, req, res, next) => { console.error(error); res.status(400).json({ message: error.message || "Request failed" }); });

if (require.main === module) app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
module.exports = app;
