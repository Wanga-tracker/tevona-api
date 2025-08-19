import express from "express";
import cors from "cors";

import searchRoute from "./src/routes/music/search.js";
import downloadRoute from "./src/routes/music/download.js";
import streamRoute from "./src/routes/music/stream.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Root
app.get("/", (req, res) => {
  res.json({
    status: "✅ API is running",
    developer: "Wanga",
    message: "Tevona is alive 🚀",
    endpoints: {
      music: [
        "/music/search?q=",
        "/music/download?id=",
        "/music/stream?id=",
      ],
    },
  });
});

// Mount routes
app.use("/music/search", searchRoute);
app.use("/music/download", downloadRoute);
app.use("/music/stream", streamRoute);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
