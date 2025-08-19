import express from "express";
import cors from "cors";

import musicRoutes from "./src/music.js"; // 👈 our first route

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    status: "✅ API is running",
    developer: "Wanga",
    message: "Tevona is alive 🚀",
    endpoints: {
      music: ["/music/search?q=", "/music/download?id="],
    },
  });
});

// Register routes
app.use("/music", musicRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
