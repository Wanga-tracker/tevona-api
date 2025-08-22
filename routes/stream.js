// routes/stream.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Stream route working ✅ (no audio yet)"
  });
});

module.exports = router;
