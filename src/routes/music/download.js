import express from "express";
import ytdl from "ytdl-core";
import { pipeline } from "stream";
import { promisify } from "util";

const router = express.Router();
const streamPipeline = promisify(pipeline);

router.get("/", async (req, res) => {
  try {
    const id = req.query.id;
    const type = req.query.type || "audio"; // audio | video
    if (!id) return res.status(400).json({ error: "Missing YouTube video ID" });

    const url = `https://www.youtube.com/watch?v=${id}`;

    if (type === "audio") {
      res.setHeader("Content-Disposition", `attachment; filename="music-${id}.mp3"`);
      res.setHeader("Content-Type", "audio/mpeg");
      await streamPipeline(
        ytdl(url, { filter: "audioonly", quality: "highestaudio" }),
        res
      );
    } else {
      res.setHeader("Content-Disposition", `attachment; filename="video-${id}.mp4"`);
      res.setHeader("Content-Type", "video/mp4");
      await streamPipeline(
        ytdl(url, { quality: "highestvideo" }),
        res
      );
    }
  } catch (err) {
    console.error("❌ Download error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
