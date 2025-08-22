// routes/stream.js
const express = require("express");
const ytdl = require("ytdl-core"); // ✅ lightweight streaming from YouTube

const router = express.Router();

// Example fixed playlist (add your own links)
const playlist = [
  "https://www.youtube.com/watch?v=jfKfPfyJRdk", // Lofi beats
  "https://www.youtube.com/watch?v=5qap5aO4i9A", // Chill lofi hip hop
  "https://www.youtube.com/watch?v=DWcJFNfaw9c", // Ambient
];

// Pick a random song
function getRandomSong() {
  const index = Math.floor(Math.random() * playlist.length);
  return playlist[index];
}

// Route: stream random song
router.get("/", async (req, res) => {
  try {
    const url = getRandomSong();

    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    res.setHeader("Content-Type", "audio/mpeg");

    // Pipe audio only (no video)
    ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
    }).pipe(res);
  } catch (err) {
    console.error("❌ Streaming error:", err.message);
    res.status(500).json({ error: "Failed to stream audio" });
  }
});

module.exports = router;
