const axios = require("axios");
const { cleanSongs, formatSongData, decodeHTML, cleanTitle, getCurrentYTKey, switchYTKey, YT_API_KEYS_LENGTH } = require("./common");

const searchCache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

const searchYouTubeSongs = async ({ query, genre, retries = YT_API_KEYS_LENGTH }) => {

    if (retries <= 1) {
        console.log("All API keys exhausted");
        return [];
    }

    let searchQuery = query || "";

    if (genre) {
        searchQuery += ` ${genre} music`;
    }

    if (!searchQuery.trim()) {
        searchQuery = "popular music";
    }

    const cacheKey = searchQuery.toLowerCase();

    // 1. Check cache
    if (searchCache.has(cacheKey)) {
        const { data, timestamp } = searchCache.get(cacheKey);

        if (Date.now() - timestamp < CACHE_TTL) {
            return data; // ⚡ instant response
        }

        searchCache.delete(cacheKey);
    }

    try {
        const res = await axios.get(
            "https://www.googleapis.com/youtube/v3/search",
            {
                params: {
                    part: "snippet",
                    q: searchQuery,
                    type: "video",
                    videoCategoryId: 10,
                    maxResults: 10,
                    videoDuration: "medium",
                    relevanceLanguage: "en",
                    key: getCurrentYTKey()
                }
            }
        );

        const cleaned = cleanSongs(res.data.items);

        //  2. Store in cache
        searchCache.set(cacheKey, {
            data: cleaned,
            timestamp: Date.now()
        });

        return cleaned;

    } catch (err) {

        console.error("Search error:", err || err.message);

        if (
            err?.error?.code === 403 &&
            err?.error?.message?.includes("quota")
        ) {
            if (retries > 1) {
                switchYTKey();
                return searchYouTubeSongs(query, genre, retries - 1);
            }
        }
        return [];
    }
};

const fetchTracksByIds = async (ids = [], retries = YT_API_KEYS_LENGTH) => {

    if (!ids.length) return [];

    if (retries <= 1) {
        console.log("All API keys exhausted");
        return [];
    }

    try {
        const res = await axios.get(
            "https://www.googleapis.com/youtube/v3/videos",
            {
                params: {
                    part: "snippet,contentDetails",
                    id: ids.join(","),
                    key: getCurrentYTKey()
                }
            }
        );

        return cleanSongs(res.data.items)

    }
    catch (err) {

        console.error("YouTube API Error:", err.response?.data || err.message);

        if (
            err?.error?.code === 403 &&
            err?.error?.message?.includes("quota")
        ) {
            if (retries > 1) {
                switchYTKey();
                return fetchTracksByIds(ids, retries - 1);
            }
        }

        throw error;
    }

};

module.exports = { searchYouTubeSongs, fetchTracksByIds }