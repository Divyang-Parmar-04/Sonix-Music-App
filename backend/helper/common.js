
const cleanTitle = (title) => {
    if (!title) return "";

    let cleaned = title;

    // Remove hashtags
    cleaned = cleaned.replace(/#\S+/g, "");

    // Remove content inside brackets ((), [], {})
    cleaned = cleaned.replace(/\(.*?\)|\[.*?\]|\{.*?\}/g, "");

    // Remove common junk words
    const removeWords = [
        "official video",
        "official music video",
        "official audio",
        "lyrics",
        "lyric video",
        "video",
        "full song",
        "hd",
        "4k",
        "remastered",
        "audio",
        "song"
    ];

    removeWords.forEach((word) => {
        const regex = new RegExp(word, "gi");
        cleaned = cleaned.replace(regex, "");
    });

    // ❌ Remove extra separators
    cleaned = cleaned.replace(/[-|–—]+/g, " ");

    // ❌ Remove extra spaces
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    // ✂️ Limit length (optional but useful)
    if (cleaned.length > 50) {
        cleaned = cleaned.substring(0, 50) + "...";
    }

    return cleaned;
};

const decodeHTML = (text) => {
    if (!text) return "";

    return text
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
};

// Helper to keep the data structure consistent
const formatSongData = (item) => {
    // Search API uses item.id.videoId, Videos API uses item.id
    const id = typeof item.id === 'string' ? item.id : item.id.videoId;

    return {
        title: cleanTitle(decodeHTML(item.snippet.title)), // 🔥 fixed
        artist: decodeHTML(item.snippet.channelTitle),
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        videoId: id,
        url: `https://www.youtube.com/watch?v=${id}`,
    };
};

const cleanSongs = (items) => {
    return items
        .filter((item) => {
            const title = item.snippet.title.toLowerCase();
            const channel = item.snippet.channelTitle.toLowerCase();

            // ❌ Remove garbage content
            const isBad =
                title.includes("lyrics") ||
                title.includes("shorts") ||
                title.includes("status") ||
                title.includes("reaction") ||
                title.includes("teaser") ||
                title.includes("trailer") ||
                title.includes("review") ||
                title.includes("gameplay") ||
                title.includes("live stream") ||
                channel.includes("fan") ||
                channel.includes("edit");

            // ✅ Force music relevance
            const isMusic =
                title.includes("song") ||
                title.includes("music") ||
                title.includes("official") ||
                title.includes("audio") ||
                channel.includes("vevo") ||
                channel.includes("music") ||
                channel.includes("records") ||
                channel.includes("t-series") ||
                channel.includes("sony");

            return (
                !isBad &&
                isMusic &&
                (item.id?.videoId || typeof item.id === "string")
            );
        })
        .map(formatSongData);
};

const parseDuration = (iso) => {
    const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    const h = parseInt(match[1]) || 0;
    const m = parseInt(match[2]) || 0;
    const s = parseInt(match[3]) || 0;

    return h * 3600 + m * 60 + s;
};


// GET YOUTUBE KEY : 

const YT_API_KEYS = [
    process.env.YOUTUBE_API_KEY1,
    process.env.YOUTUBE_API_KEY2,
    process.env.YOUTUBE_API_KEY3,
]

const YT_API_KEYS_LENGTH = YT_API_KEYS.length;

let currentKeyIndex = 0;

const getCurrentYTKey = () => YT_API_KEYS[currentKeyIndex];

const switchYTKey = () => {
    currentKeyIndex = (currentKeyIndex + 1) % YT_API_KEYS.length;
    console.log("🔁 Switching to next API key:", currentKeyIndex);
};

// GET RAPID_API_KEY : 

const RP_API_KEYS = [
    process.env.RAPID_API_KEY1,
    process.env.RAPID_API_KEY2,
    process.env.RAPID_API_KEY3,
]

const RP_API_KEYS_LENGTH = RP_API_KEYS.length;

let currentRPKeyIndex = 0;

const getCurrentRapidAPIKey = () => RP_API_KEYS[currentRPKeyIndex];

const switchRapidAPIKey = () => {
    currentRPKeyIndex = (currentRPKeyIndex + 1) % RP_API_KEYS.length;
    console.log("🔁 Switching to next API key:", currentRPKeyIndex);
};


module.exports = { cleanSongs, cleanTitle, formatSongData, decodeHTML, parseDuration, getCurrentYTKey, getCurrentRapidAPIKey, switchYTKey, switchRapidAPIKey, YT_API_KEYS_LENGTH, RP_API_KEYS_LENGTH }