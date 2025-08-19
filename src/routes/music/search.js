import express from "express";
import yts from "yt-search";
import ytdl from "ytdl-core";

const router = express.Router();

// 🔍 Search music
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing query" });

    const results = await yts(query);

    // Map results + attach ready downloadUrl
    const formatted = results.videos.slice(0, 10).map((video) => ({
      videoId: video.videoId,
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnail,
      duration: video.duration,
      views: video.views,
      author: video.author.name,
      // 👇 This makes it plug-and-play for frontend
      downloadUrl: `${process.env.BASE_URL || "http://localhost:5000"}/music/download?id=${video.videoId}`,
      streamUrl: `${process.env.BASE_URL || "http://localhost:5000"}/music/stream?id=${video.videoId}`,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🎵 Download music
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

// 🎶 Stream music (no download, just play)
router.get("/stream", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "Missing YouTube video ID" });

    const url = `https://www.youtube.com/watch?v=${id}`;
    ytdl(url, { filter: "audioonly" }).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
