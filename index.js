// index.js
const express = require("express");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// Utility to hash
function genHash(algorithm, input) {
  return crypto.createHash(algorithm).update(input).digest("hex");
}

app.get("/api/test-hash/:videoId", (req, res) => {
  const videoId = req.params.videoId;

  // Try different combinations
  const attempts = {
    md5_id: genHash("md5", videoId),
    sha1_id: genHash("sha1", videoId),
    sha256_id: genHash("sha256", videoId),

    // Try reversing videoId
    md5_rev: genHash("md5", videoId.split("").reverse().join("")),
    sha1_rev: genHash("sha1", videoId.split("").reverse().join("")),
    sha256_rev: genHash("sha256", videoId.split("").reverse().join("")),

    // Try double-hash
    md5_md5: genHash("md5", genHash("md5", videoId)),
    sha1_sha1: genHash("sha1", genHash("sha1", videoId)),

    // Try mixed
    md5_sha1: genHash("md5", genHash("sha1", videoId)),
    sha1_md5: genHash("sha1", genHash("md5", videoId)),

    // Try with static salts (just guesses)
    md5_salt1: genHash("md5", "gifted" + videoId),
    md5_salt2: genHash("md5", videoId + "gifted"),
    sha1_salt1: genHash("sha1", "gifted" + videoId),
    sha1_salt2: genHash("sha1", videoId + "gifted"),
  };

  res.json({
    videoId,
    attempts,
    exampleUrls: Object.fromEntries(
      Object.entries(attempts).map(([k, v]) => [k, `https://dl.ymcdn.org/${v}/${videoId}`])
    ),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
