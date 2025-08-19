import express from "express";
import ytdl from "ytdl-core";

const router = express.Router();

// GET /music/download?id=VIDEO_ID
router.get("/", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "Missing YouTube video ID" });

    const url = `https://www.youtube.com/watch?v=${id}`;

    res.setHeader("Content-Disposition", `attachment; filename="${id}.mp3"`);
    res.setHeader("Content-Type", "audio/mpeg");

    ytdl(url, { filter: "audioonly", quality: "highestaudio" }).pipe(res);
  } catch (err) {
    console.error("[/music/download]", err);
    res.status(500).json({ error: err.message || "Download failed" });
  }
});

export default router;
