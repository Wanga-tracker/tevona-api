// index.js
const express = require("express");
const cors = require("cors");
const YT = require("./YT");
const ytdl = require("youtubedl-core");
const ffmpeg = require("fluent-ffmpeg");
const { randomBytes } = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Search Endpoint
app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing query param ?q=" });

    const results = await YT.searchTrack(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ MP3 Download Endpoint
app.get("/api/download/mp3", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "Missing id param" });

    const url = `https://www.youtube.com/watch?v=${id}`;
    const info = await ytdl.getInfo(url);

    res.setHeader("Content-Disposition", `attachment; filename="${info.videoDetails.title}.mp3"`);
    res.setHeader("Content-Type", "audio/mpeg");

    const stream = ytdl(url, { filter: "audioonly", quality: 140 });

    ffmpeg(stream)
      .audioCodec("libmp3lame")
      .audioBitrate(128)
      .toFormat("mp3")
      .pipe(res, { end: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ MP4 Download Endpoint
app.get("/api/download/mp4", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "Missing id param" });

    const url = `https://www.youtube.com/watch?v=${id}`;
    const info = await ytdl.getInfo(url);

    res.setHeader("Content-Disposition", `attachment; filename="${info.videoDetails.title}.mp4"`);
    res.setHeader("Content-Type", "video/mp4");

    ytdl(url, { quality: "highestvideo" }).pipe(res);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
