import express from "express";
import yts from "yt-search";

const router = express.Router();

// GET /music/search?q=...
router.get("/", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: "Missing query" });

    const results = await yts(q);
    // keep payload similar to what you had
    res.json(results.videos.slice(0, 10));
  } catch (err) {
    console.error("[/music/search]", err);
    res.status(500).json({ error: err.message || "Search failed" });
  }
});

export default router;
