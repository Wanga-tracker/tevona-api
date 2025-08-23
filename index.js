const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// ✅ YouTube search
app.get("/api/youtube/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Missing query ?q=" });

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
      q
    )}&maxResults=10&key=${process.env.YT_API_KEY}`;

    const { data } = await axios.get(url);

    res.json({
      status: 200,
      result: data.items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.high?.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ YouTube download via fabdl.com
app.get("/api/youtube/download", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "Missing id ?id=" });

  try {
    const url = `https://api.fabdl.com/youtube/download?v=${id}`;
    const { data } = await axios.get(url);

    if (!data.result?.audio_url) {
      return res.status(500).json({ error: "No audio found", raw: data });
    }

    // redirect to actual audio file
    res.redirect(data.result.audio_url);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Tevona API running on port ${PORT}`);
});
