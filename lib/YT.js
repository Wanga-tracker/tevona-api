// lib/YT.js
const ytdl = require("ytdl-core");
const yts = require("youtube-yts");
const ytM = require("node-youtube-music");
const { randomBytes } = require("crypto");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const NodeID3 = require("node-id3");
const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const { fetchBuffer } = require("../myfunc2");

ffmpeg.setFfmpegPath(ffmpegPath);

const AUDIO_DIR = path.join(__dirname, "..", "GlobalMedia", "audio");
mkdirp.sync(AUDIO_DIR);

const ytIdRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/;

class YT {
  static isYTUrl(url) {
    return ytIdRegex.test(url);
  }

  static getVideoID(url) {
    if (!this.isYTUrl(url)) throw new Error("is not YouTube URL");
    const m = ytIdRegex.exec(url);
    return m ? m[1] : null;
  }

  static async WriteTags(filePath, Metadata) {
    try {
      const imageBuffer = Metadata.Image ? (await fetchBuffer(Metadata.Image)).buffer : null;
      const tags = {
        title: Metadata.Title,
        artist: Metadata.Artist,
        originalArtist: Metadata.Artist,
        album: Metadata.Album,
        year: Metadata.Year || "",
      };
      if (imageBuffer) {
        tags.image = {
          mime: "jpeg",
          type: { id: 3, name: "front cover" },
          imageBuffer,
          description: `Cover of ${Metadata.Title}`,
        };
      }
      NodeID3.write(tags, filePath);
    } catch (err) {
      console.warn("WriteTags failed:", err);
    }
  }

  static async search(query, options = {}) {
    const r = await yts.search({ query, hl: "en", gl: "US", ...options });
    return r.videos;
  }

  static async searchTrack(query) {
    // node-youtube-music returns an array of tracks
    const ytMusic = await ytM.searchMusics(query);
    return ytMusic.map((m) => ({
      isYtMusic: true,
      title: `${m.title} - ${m.artists.map((x) => x.name).join(" ")}`,
      artist: m.artists.map((x) => x.name).join(" "),
      id: m.youtubeId,
      url: "https://youtu.be/" + m.youtubeId,
      album: m.album,
      duration: { seconds: m.duration.totalSeconds, label: m.duration.label },
      image: m.thumbnailUrl.replace("w120-h120", "w600-h600"),
    }));
  }

  static async downloadMusic(query) {
    // query = youtube id/url or a search query array
    const getTrack = Array.isArray(query) ? query : await this.searchTrack(query);
    if (!getTrack || !getTrack[0]) throw new Error("No track found");
    const search = getTrack[0];
    const url = `https://www.youtube.com/watch?v=${search.id}`;
    return await this.mp3(url, { Title: search.title, Artist: search.artist, Image: search.image, Album: search.album }, true);
  }

  static async mp4(query, quality = 134) {
    if (!query) throw new Error("Video ID or YouTube Url is required");
    const videoId = this.isYTUrl(query) ? this.getVideoID(query) : query;
    const info = await ytdl.getInfo("https://www.youtube.com/watch?v=" + videoId);
    const format = ytdl.chooseFormat(info.formats, { format: quality, filter: "videoandaudio" });
    return {
      title: info.videoDetails.title,
      thumb: info.videoDetails.thumbnails.slice(-1)[0],
      date: info.videoDetails.publishDate,
      duration: info.videoDetails.lengthSeconds,
      channel: info.videoDetails.author.name,
      quality: format ? format.qualityLabel : null,
      contentLength: format ? format.contentLength : null,
      description: info.videoDetails.description,
      videoUrl: format ? format.url : null,
    };
  }

  // Convert and save to disk and return path
  static async mp3(url, metadata = {}, autoWriteTags = false) {
    if (!url) throw new Error("Video ID or YouTube Url is required");
    url = this.isYTUrl(url) ? "https://www.youtube.com/watch?v=" + this.getVideoID(url) : url;

    const info = await ytdl.getInfo(url);
    const stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });

    const filename = `${randomBytes(4).toString("hex")}.mp3`;
    const outPath = path.join(AUDIO_DIR, filename);

    await new Promise((resolve, reject) => {
      ffmpeg(stream)
        .audioFrequency(44100)
        .audioChannels(2)
        .audioBitrate(128)
        .audioCodec("libmp3lame")
        .format("mp3")
        .on("error", (err) => {
          reject(err);
        })
        .on("end", () => resolve())
        .save(outPath);
    });

    if (Object.keys(metadata).length !== 0) {
      await this.WriteTags(outPath, metadata);
    }
    if (autoWriteTags) {
      const vd = info.videoDetails || {};
      await this.WriteTags(outPath, {
        Title: vd.title,
        Album: vd.author?.name || "",
        Year: (vd.publishDate || "").split("-")[0] || "",
        Image: vd.thumbnails?.slice(-1)[0]?.url || "",
      });
    }

    return {
      meta: {
        title: info.videoDetails.title,
        channel: info.videoDetails.author?.name,
        seconds: info.videoDetails.lengthSeconds,
        image: info.videoDetails.thumbnails?.slice(-1)[0]?.url,
      },
      path: outPath,
      size: fs.statSync(outPath).size,
    };
  }

  // stream converted mp3 (returns readable stream)
  static async streamMp3(url) {
    url = this.isYTUrl(url) ? "https://www.youtube.com/watch?v=" + this.getVideoID(url) : url;
    const stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });
    // We'll use ffmpeg and return the stdout stream in mp3 format
    const proc = ffmpeg(stream)
      .audioFrequency(44100)
      .audioChannels(2)
      .audioBitrate(128)
      .audioCodec("libmp3lame")
      .format("mp3")
      .on("error", (e) => {
        console.error("ffmpeg stream error:", e);
      });

    // fluent-ffmpeg gives us a stream via .pipe(); use .stream()
    const passthrough = proc.pipe();
    return passthrough;
  }
}

module.exports = YT;
