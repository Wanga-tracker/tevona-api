const express = require("express");
const cors = require("cors");
const ytSearch = require("yt-search");
const crypto = require("crypto");

const app = express();
app.use(cors());

// ✅ Helper: make md5 hash
function md5(str) {
  return crypto.createHash("md5").update(str).digest("hex");
}

/**
 * ROUTE: Search YouTube videos
 * Example: /api/search?q=alan+walker
 */
app.get("/api/search", async (req, res) => {
  const q = req.query.q;
  if (!q) {
    return res.status(400).json({ error: "Missing ?q=" });
  }

  try {
    const result = await ytSearch(q);
    const videos = result.videos.slice(0, 10).map((v) => ({
      id: v.videoId,
      title: v.title,
      duration: v.timestamp,
      views: v.views,
      channel: v.author?.name,
      thumbnail: v.thumbnail,
      url: `https://www.youtube.com/watch?v=${v.videoId}`,
    }));

    res.json({ status: 200, result: videos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ROUTE: Get direct download link
 * Example: /api/download?id=60ItHLz5WEA
 */
app.get("/api/download", async (req, res) => {
  const videoId = req.query.id;
  if (!videoId) {
    return res.status(400).json({ error: "Missing ?id=" });
  }

  try {
    // 🔑 Generate hash (assuming it's md5(videoId))
    const hash = md5(videoId);

    const downloadUrl = `https://dl.ymcdn.org/${hash}/${videoId}`;

    res.json({
      status: 200,
      videoId,
      hash,
      download_url: downloadUrl,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
