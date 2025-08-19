import express from "express";
import yts from "yt-search";
import ytdl from "ytdl-core";

const router = express.Router();

// Search music
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing query" });

    const results = await yts(query);
    res.json(results.videos.slice(0, 10));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download music
router.get("/download", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "Missing YouTube video ID" });

    const url = `https://www.youtube.com/watch?v=${id}`;
    res.header("Content-Disposition", 'attachment; filename="music.mp3"');
    ytdl(url, { filter: "audioonly" }).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
