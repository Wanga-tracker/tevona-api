const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const morgan = require("morgan");

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

    // Run yt-dlp
    const cmd = `yt-dlp -f mp4 -o "${filepath}" "${videoUrl}"`;
    console.log("Running:", cmd);

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("yt-dlp error:", stderr);
        return res.status(500).json({ error: "Download failed", details: stderr });
      }

      console.log("yt-dlp output:", stdout);

      const downloadUrl = `${req.protocol}://${req.get("host")}/files/${filename}`;
      res.json({
        title: "Downloaded video",
        download_url: downloadUrl
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Serve files ---
app.use("/files", express.static(FILES_DIR));

app.get("/", (req, res) => {
  res.send("✅ Tevona API is running. Use /ytdown?url=YOUTUBE_LINK");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
