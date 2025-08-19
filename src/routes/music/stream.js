import express from "express";
import ytdl from "ytdl-core";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "Missing YouTube video ID" });

    const url = `https://www.youtube.com/watch?v=${id}`;
    ytdl(url, { filter: "audioonly" }).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
