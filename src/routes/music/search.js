import express from "express";
import yts from "yt-search";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing query" });

    const results = await yts(query);

    const formatted = results.videos.slice(0, 10).map((video) => ({
      videoId: video.videoId,
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnail,
      duration: video.duration,
      views: video.views,
      author: video.author.name,
      downloadUrl: `${process.env.BASE_URL || "http://localhost:5000"}/music/download?id=${video.videoId}`,
      streamUrl: `${process.env.BASE_URL || "http://localhost:5000"}/music/stream?id=${video.videoId}`,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
