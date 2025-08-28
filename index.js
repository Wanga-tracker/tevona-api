const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const morgan = require("morgan");
const ytdlp = require("yt-dlp-exec"); // ✅ Node wrapper

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const FILES_DIR = path.join(__dirname, "files");
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR);
}

// --- Download route ---
app.get("/ytdown", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: "Missing ?url=" });
  }

  try {
    const filename = `video_${Date.now()}.mp4`;
    const filepath = path.join(FILES_DIR, filename);

    console.log("Downloading:", videoUrl);

    // Run yt-dlp (directly via Node wrapper)
    await ytdlp(videoUrl, {
      output: filepath,
      format: "mp4"
    });

    const downloadUrl = `${req.protocol}://${req.get("host")}/files/${filename}`;
    res.json({
      title: "Downloaded video",
      download_url: downloadUrl
    });
  } catch (err) {
    console.error("yt-dlp error:", err);
    res.status(500).json({ error: "Download failed", details: err.message });
  }
});

// --- Serve files ---
app.use("/files", express.static(FILES_DIR));

app.get("/", (req, res) => {
  res.send("✅ Tevona API is running. Use /ytdown?url=YOUTUBE_LINK");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
