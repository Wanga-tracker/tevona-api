import express from "express";
import cors from "cors";
import morgan from "morgan";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan("dev"));

async function scrapeYTMP4(videoUrl) {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto("https://ytmp4.is/en/", { waitUntil: "networkidle2" });

  // Input video URL
  await page.type("input[name='q']", videoUrl);
  await page.click("button[type='submit']");

  // Wait for results to appear
  await page.waitForSelector("a", { timeout: 15000 }).catch(() => {});

  const results = await page.evaluate(() => {
    const title = document.querySelector("title")?.innerText || "Unknown";
    const thumbnail = document.querySelector("img")?.src || null;
    const links = [...document.querySelectorAll("a[href*='.mp4'], a[href*='.mp3']")].map(a => ({
      text: a.innerText.trim(),
      href: a.href
    }));
    return { title, thumbnail, links };
  });

  await browser.close();
  return results;
}

app.get("/ytmp4", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: "Missing ?url=" });

  try {
    const data = await scrapeYTMP4(videoUrl);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Puppeteer YTMP4 API running on port ${PORT}`);
});
