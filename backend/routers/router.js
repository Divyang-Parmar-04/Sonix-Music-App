const express = require("express");
const axios = require('axios');
const router = express.Router();

// const { getNewReleases, getTrending, getTopSongs } = require("../helper/youtube_fetch.js");
const { searchYouTubeSongs, fetchTracksByIds } = require("../helper/youtube_search.js");

const { parseDuration } = require("../helper/common.js");
const { handleStreamSong } = require("../helper/music_stream.js");
const { searchYouTubeMusicSongs, fetchYTMusicTracksByIds } = require("../helper/ytmusic_search.js");
const { getYTmusicTrending, getYTmusicNewReleases, getYTmusicTopSongs } = require("../helper/ytmusic_fetch.js");

const API_KEY = process.env.YOUTUBE_API_KEY;

// Initial Fetch : 
let cache = null;
let lastFetchTime = 0;

router.get("/home", async (req, res) => {
  const now = Date.now();

  // cache for 30 minutes
  if (cache && now - lastFetchTime < 30 * 60 * 1000) {
    return res.json(cache);
  }

  const [trending, newReleases, topSongs] =
    await Promise.allSettled([
      getYTmusicTrending(),
      getYTmusicNewReleases(),
      getYTmusicTopSongs()
    ]);

  cache = {
    trending: trending.value || [],
    newReleases: newReleases.value || [],
    topPlaylists: topSongs.value || []
  };

  lastFetchTime = now;

  res.json(cache);
});

//search : 
router.get("/search", async (req, res) => {
  try {
    const { q, genre } = req.query;

    const songs = await searchYouTubeMusicSongs({
      query: q,
      genre
    });

    res.json(songs);

  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
});

// find by ids : 
router.get("/tracks-by-ids", async (req, res) => {
  try {

    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ error: "IDs are required" });
    }

    const idArray = ids.split(",");
    const tracks = await fetchTracksByIds(idArray);

    res.json(tracks);

  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
});

// Stream : 
router.get("/stream", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    // Extract videoId
    const videoIdMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube ID" });
    }

    const { finalAudioUrl, duration } = await handleStreamSong(videoId)

    //  Send both
    res.json({
      audioUrl: finalAudioUrl,
      duration
    });

  } catch (err) {
    console.error("STREAM ERROR:", err.message);
    res.status(500).json({ error: "Failed to get audio stream" });
  }
});

module.exports = router;