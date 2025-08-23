// index.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Your YouTube API key (replace or keep fallback)
const YT_API_KEY =
  process.env.YT_API_KEY ||
  "AIzaSyDzNRcpZV82LPaHjRabNeZ26JqfiDiqY50";

app.use(cors());

// ==========================
// Search Route
// ==========================
app.get("/api/youtube/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Missing query ?q=" });

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
      q
    )}&maxResults=10&key=${YT_API_KEY}`;

    const { data } = await axios.get(url);

    return res.json({
      status: 200,
      results: data.items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails?.high?.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      })),
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Search failed" });
  }
});

// ==========================
// Download Route
// ==========================
app.get("/api/youtube/download", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "Missing video id ?id=" });

  try {
    // 🔹 Replace with the actual API you confirmed gives download_url
    const apiUrl = `https://gifted-api.example.com/youtube?url=https://www.youtube.com/watch?v=${id}`;
    const { data } = await axios.get(apiUrl);

    if (!data?.result?.download_url) {
      return res.status(500).json({ error: "No download URL found" });
    }

    // Redirect client directly to download
    return res.redirect(data.result.download_url);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Download failed" });
  }
});

// ==========================
// Start server
// ==========================
app.listen(PORT, () => {
  console.log(`✅ Tevona API running on http://localhost:${PORT}`);
});
