import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Put your API key here (later we move to .env)
const YOUTUBE_API_KEY = "AIzaSyDzNRcpZV82LPaHjRabNeZ26JqfiDiqY50";

router.get("/", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Missing search query" });

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(
      q
    )}&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    const results = data.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      author: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.default.url,
    }));

    res.json(results);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ error: "Failed to search YouTube" });
  }
});

export default router;
