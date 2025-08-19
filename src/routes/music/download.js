import express from "express";
import * as play from "play-dl";

const router = express.Router();

router.get("/download", async (req, res) => {
  try {
    const { id, type } = req.query;
    if (!id) return res.status(400).json({ error: "Missing video ID" });

    const url = `https://www.youtube.com/watch?v=${id}`;
    const stream = await play.stream(url, { quality: 2 });

    res.setHeader("Content-Disposition", `attachment; filename="track.${type === "video" ? "mp4" : "mp3"}"`);

    if (type === "video") {
      stream.stream.pipe(res); // send video
    } else {
      // audio only
      stream.stream.pipe(res);
    }
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Failed to download media" });
  }
});

export default router;
