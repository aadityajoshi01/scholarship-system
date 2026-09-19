const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load the root .env when started from the repository root, with backend/.env as a fallback.
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/auth");
const applicationRoutes = require("./routes/applications");
const documentRoutes = require("./routes/documents");

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/health", (req, res) => {
  res.json({ service: "scholarship-backend", status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/documents", documentRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(400).json({ message: error.message || "Request failed" });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

module.exports = app;
