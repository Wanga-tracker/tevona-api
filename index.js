// index.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Tenova API is running 🎶" });
});

// YouTube Search
const YT_API_KEY =
  process.env.YT_API_KEY || "AIzaSyDzNRcpZV82LPaHjRabNeZ26JqfiDiqY50";

app.get("/api/youtube/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Missing query ?q=" });

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
      q
    )}&maxResults=10&key=${YT_API_KEY}`;

    const { data } = await axios.get(url);
    res.json({
      status: 200,
      result: data.items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails?.high?.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// YouTube Download (redirect)
app.get("/api/youtube/download", (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing url" });
  res.redirect(url);
});

app.listen(PORT, () =>
  console.log(`🔥 Tenova API running on http://localhost:${PORT}`)
);
