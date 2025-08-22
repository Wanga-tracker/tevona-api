// routes/stream.js
const express = require("express");

const router = express.Router();

// Example fixed playlist (replace with your own)
const playlist = [
  "https://www.youtube.com/watch?v=jfKfPfyJRdk", // Lofi beats
  "https://www.youtube.com/watch?v=5qap5aO4i9A", // Chill lofi
  "https://www.youtube.com/watch?v=DWcJFNfaw9c", // Ambient
];

// Pick a random song
function getRandomSong() {
  const index = Math.floor(Math.random() * playlist.length);
  return playlist[index];
}

// Route: return random YouTube link as JSON
router.get("/", (req, res) => {
  const url = getRandomSong();
  res.json({
    status: "ok",
    message: "Stream route working ✅",
    url,
  });
});

module.exports = router;
