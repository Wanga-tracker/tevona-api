import express from "express";
import ytdl from "ytdl-core";

const router = express.Router();

router.get("/", async (req, res) => {
  const { id, type } = req.query;
  if (!id || !type) return res.status(400).json({ error: "Missing id or type" });

  try {
    const url = `https://www.youtube.com/watch?v=${id}`;
    const format = type === "audio" ? { filter: "audioonly" } : { quality: "highestvideo" };

    res.header("Content-Disposition", `attachment; filename="${id}.${type === "audio" ? "mp3" : "mp4"}"`);

    ytdl(url, format).pipe(res);
  } catch (err) {
    console.error("❌ Download error:", err);
    res.status(500).json({ error: "Failed to download video" });
  }
});

export default router;
