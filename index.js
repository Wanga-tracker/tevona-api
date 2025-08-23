// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const YT = require("./lib/YT");
const { pipeline } = require("stream");
const util = require("util");
const streamPipeline = util.promisify(pipeline);

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.PORT || 10000;

// Ensure output directory
const MEDIA_DIR = path.join(__dirname, "GlobalMedia", "audio");
mkdirp.sync(MEDIA_DIR);

// --- routes ---

// health
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Tevona downloader API running" });
});

// Search (YouTube Music first, fallback to YT search)
app.get("/api/search", async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  if (!q) return res.status(400).json({ error: "Missing ?q= query" });
  try {
    const results = await YT.searchTrack(q); // returns array of track objects
    return res.json({ status: 200, result: results });
  } catch (err) {
    console.error("search error:", err);
    // fallback to simple yts search
    try {
      const raw = await YT.search(q);
      return res.json({ status: 200, result: raw });
    } catch (e) {
      console.error("fallback search error:", e);
      return res.status(500).json({ error: "Search failed", details: String(e) });
    }
  }
});

// Download — converts to mp3, returns as attachment, deletes file after stream
// usage: /api/download?url=<youtube-url>&filename=some.mp3
app.get("/api/download", async (req, res) => {
  const url = (req.query.url || "").toString();
  if (!url) return res.status(400).json({ error: "Missing url param" });

  try {
    // We'll use YT.mp3 which returns { meta, path, size }
    const fileResult = await YT.mp3(url, {}, true); // auto write tags
    const filePath = fileResult.path;
    const outName = (req.query.filename || `${fileResult.meta.title || "track"}.mp3`).replace(/[^\w.\- ]+/g, "_");

    res.setHeader("Content-Disposition", `attachment; filename="${outName}"`);
    res.setHeader("Content-Type", "audio/mpeg");

    // Stream file to client
    const readStream = fs.createReadStream(filePath);
    readStream.on("error", (err) => {
      console.error("readstream error:", err);
      try { fs.unlinkSync(filePath); } catch (_) {}
      res.status(500).end("Read error");
    });

    // When finished, remove file
    readStream.on("end", () => {
      try { fs.unlinkSync(filePath); } catch (_) {}
    });

    readStream.pipe(res);
  } catch (err) {
    console.error("download error:", err);
    return res.status(500).json({ error: "Download failed", details: String(err) });
  }
});

// Stream without saving — pipes converted mp3 to response
// usage: /api/stream?url=<youtube-url>
app.get("/api/stream", async (req, res) => {
  const url = (req.query.url || "").toString();
  if (!url) return res.status(400).json({ error: "Missing url param" });

  try {
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");

    // YT.streamMp3 returns a stream (we'll add that helper in lib/YT)
    const audioStream = await YT.streamMp3(url);
    await streamPipeline(audioStream, res);
  } catch (err) {
    console.error("stream error:", err);
    return res.status(500).json({ error: "Stream failed", details: String(err) });
  }
});

// small test route for metadata
app.get("/api/info", async (req, res) => {
  const url = (req.query.url || "").toString();
  if (!url) return res.status(400).json({ error: "Missing url param" });
  try {
    const info = await YT.mp4(url, 134);
    return res.json({ status: 200, result: info });
  } catch (err) {
    console.error("info error:", err);
    return res.status(500).json({ error: "Info failed", details: String(err) });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Tevona downloader running on http://localhost:${PORT}`);
});
