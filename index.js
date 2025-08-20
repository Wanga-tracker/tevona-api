import express from "express";
import cors from "cors";

import searchRoute from "./routes/search.js";
import downloadRoute from "./routes/download.js";

const app = express();
const PORT = process.env.PORT || 3001; // use 3001 for local dev

app.use(cors());
app.use(express.json());

// Health check
app.get("/ping", (req, res) => {
  res.json({ status: "ok", message: "pong 🏓" });
});

// Routes
app.use("/music/search", searchRoute);
app.use("/music/download", downloadRoute);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ API running on http://0.0.0.0:${PORT}`);
});
