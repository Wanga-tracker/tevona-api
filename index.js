// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const ytdl = require("ytdl-core");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.PORT || 10000;

// health
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Tevona downloader API running" });
});

// --- SEARCH (keep same as before if using YT.js) ---
const YT = require("./lib/YT");
app.get("/api/search", async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  if (!q) return res.status(400).json({ error: "Missing ?q= query" });
  try {
    const results = await YT.searchTrack(q);
    return res.json({ status: 200, result: results });
  } catch (err) {
    console.error("search error:", err);
    try {
      const raw = await YT.search(q);
      return res.json({ status: 200, result: raw });
    } catch (e) {
      console.error("fallback search error:", e);
      return res.status(500).json({ error: "Search failed", details: String(e) });
    }
  }
});

// --- DOWNLOAD (direct .m4a, no ffmpeg) ---
app.get("/api/download", async (req, res) => {
  const url = (req.query.url || "").toString();
  if (!url) return res.status(400).json({ error: "Missing url param" });

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s-]/g, "_");
    const filename = `${title}.m4a`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "audio/mp4");

    const stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });
    stream.pipe(res);

    stream.on("error", (err) => {
      console.error("ytdl error:", err);
      res.status(500).end("Download failed");
    });
  } catch (err) {
    console.error("download error:", err);
    res.status(500).json({ error: "Download failed", details: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Tevona downloader running on http://localhost:${PORT}`);
});
