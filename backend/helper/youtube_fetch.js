const axios = require("axios");
const { cleanSongs, formatSongData, decodeHTML, cleanTitle, YT_API_KEYS_LENGTH, getCurrentYTKey, switchYTKey } = require("./common");


const fetchYouTube = async (endpoint, params , retries = YT_API_KEYS_LENGTH) => {

    if (retries <= 1) {
        console.log("All API keys exhausted");
        return [];
    }

    try {
        const res = await axios.get(
            `https://www.googleapis.com/youtube/v3/${endpoint}`,
            {
                params: {
                    part: "snippet",
                    key: getCurrentYTKey(),
                    ...params
                }
            }
        );

        return endpoint === "search"
            ? cleanSongs(res.data.items)
            : res.data.items.map(formatSongData);

    } catch (err) {
        
        console.error("YouTube API Error:", err.response?.data || err.message);

        if (
            err?.error?.code === 403 &&
            err?.error?.message?.includes("quota")
        ) {
            if (retries > 1) {
                switchYTKey();
                return fetchYouTube(endpoint, params, retries - 1);
            }
        }

        return [];
    }
};

const getTrending = async () => {
    try {
        return await fetchYouTube("videos", {
            chart: "mostPopular",
            maxResults: 10,
            regionCode: "IN"
        });
    } catch (err) {
        console.error("Trending error:", err);
        return [];
    }
};

const getNewReleases = async () => {
    return await fetchYouTube("search", {
        q: "official music video",
        order: "date",
        maxResults: 6,
        type: "video",
        videoDuration: "medium"
    });
};

const getTopSongs = async () => {
    return await fetchYouTube("search", {
        q: "top hindi songs official",
        order: "viewCount",
        maxResults: 6,
        type: "video"
    });

};

module.exports = { getNewReleases, getTrending, getTopSongs };