// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();

// === Middleware ===
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// === Rate limiting (basic protection) ===
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests/minute
});
app.use(limiter);

// === Routes ===
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "🎵 Tevona API is running",
    docs: "/api/docs",
  });
});

// Example placeholder route for streaming
app.use("/api/stream", require("./routes/stream"));

// === Error handler ===
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// === Start server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Tevona API running on http://localhost:${PORT}`);
});
