// index.js
const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// Generate different hash attempts
function generateHashes(videoId) {
  const hashes = {};
  hashes.md5_id = crypto.createHash("md5").update(videoId).digest("hex");
  hashes.sha1_id = crypto.createHash("sha1").update(videoId).digest("hex");
  hashes.sha256_id = crypto.createHash("sha256").update(videoId).digest("hex");
  hashes.md5_rev = crypto.createHash("md5").update(videoId.split("").reverse().join("")).digest("hex");
  hashes.sha1_rev = crypto.createHash("sha1").update(videoId.split("").reverse().join("")).digest("hex");
  hashes.sha256_rev = crypto.createHash("sha256").update(videoId.split("").reverse().join("")).digest("hex");
  return hashes;
}

// Route to generate possible download links
app.get("/api/youtube/crack", (req, res) => {
  const videoId = req.query.id;
  if (!videoId) {
    return res.status(400).json({ error: "Missing videoId ?id=" });
  }

  const attempts = generateHashes(videoId);

  const exampleUrls = {};
  for (const [key, hash] of Object.entries(attempts)) {
    exampleUrls[key] = `https://dl.ymcdn.org/${hash}/${videoId}`;
  }

  res.json({ videoId, attempts, exampleUrls });
});

// Route to test direct download with headers
app.get("/api/youtube/download", async (req, res) => {
  const videoId = req.query.id;
  if (!videoId) {
    return res.status(400).json({ error: "Missing videoId ?id=" });
  }

  const hash = crypto.createHash("md5").update(videoId).digest("hex"); // try MD5 first
  const url = `https://dl.ymcdn.org/${hash}/${videoId}`;

  try {
    const response = await axios.get(url, {
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
        "Accept": "*/*",
        "Referer": "https://youtube.com/",
      },
    });

    res.setHeader("Content-Disposition", `attachment; filename="${videoId}.mp3"`);
    res.setHeader("Content-Type", response.headers["content-type"] || "audio/mpeg");

    response.data.pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Download failed", details: err.message, url });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
