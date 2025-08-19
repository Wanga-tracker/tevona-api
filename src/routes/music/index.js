import express from "express";
import search from "./search.js";
import download from "./download.js";

const router = express.Router();

// final paths: /music/search and /music/download
router.use("/search", search);
router.use("/download", download);

export default router;
