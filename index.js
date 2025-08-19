import express from "express";
import cors from "cors";
import yts from "yt-search";
import ytdl from "ytdl-core";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 🟢 Root route / Heartbeat
app.get("/", (req, res) => {
  res.json({
    status: true,
    developer: "Wanga",
    project: "Tevona API",
    message: "🚀 Tevona backend is live and operational",
    uptime: process.uptime().toFixed(0) + "s",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    docs: "https://github.com/Wanga-tracker/tevona-api",
    services: {
      music: ["/music/search?q=", "/music/download?id="],
      ai: ["/ai/chat"],
      scraping: ["/scraper/news"],
      movies: ["/movies/stream"]
    }
  });
});

/* =============== 🎶 MUSIC ROUTES =============== */

// Search music
app.get("/music/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing query" });

    const results = await yts(query);
    res.json(results.videos.slice(0, 10)); // return top 10
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download music
app.get("/music/download", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "Missing YouTube video ID" });

    const url = `https://www.youtube.com/watch?v=${id}`;
    res.header("Content-Disposition", 'attachment; filename="music.mp3"');
    ytdl(url, { filter: "audioonly" }).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =============== 🤖 AI ROUTES (stub) =============== */
app.post("/ai/chat", async (req, res) => {
  const { message } = req.body;
  // TODO: Plug into GPT4All / LLaMA later
  res.json({
    status: true,
    input: message,
    reply: `Echo: ${message}`
  });
});

/* =============== 📰 SCRAPER ROUTES (stub) =============== */
app.get("/scraper/news", async (req, res) => {
  try {
    const { data } = await axios.get("https://news.ycombinator.com/");
    const $ = cheerio.load(data);
    const titles = [];
    $("a.titleline").each((_, el) => titles.push($(el).text())); // updated selector
    res.json({ count: titles.length, articles: titles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =============== 🎬 MOVIES (stub) =============== */
app.get("/movies/stream", (req, res) => {
  res.json({
    status: true,
    msg: "🎬 Movie streaming route placeholder",
    next_step: "Integrate torrent/stream service"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
