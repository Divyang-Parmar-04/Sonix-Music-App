const YTMusic = require("ytmusic-api");
const { cleanTitle, decodeHTML } = require("./common");
const ytmusic = new YTMusic();

let isInitialized = false;

const initYTMusic = async () => {
    if (!isInitialized) {
        await ytmusic.initialize();
        isInitialized = true;
    }
};

const searchYouTubeMusicSongs = async ({ query, genre }) => {

    await initYTMusic();

    let searchQuery = query || "";

    if (genre) {
        searchQuery += `${genre} songs`;
    }

    if (!searchQuery.trim()) {
        searchQuery = "popular music";
    }

    try {
        const results = await ytmusic.search(searchQuery);

        //  Only SONG type
        const songs = results.filter(item => item.type === "SONG");

        const cleaned = songs.map(item => {
            const id = item.videoId;

            return {
                title: cleanTitle(decodeHTML(item.name)), // 🔥 fixed
                artist: decodeHTML(item.artist?.name || "Unknown"),
                thumbnail:
                    item.thumbnails?.[item.thumbnails.length - 1]?.url || "",
                videoId: id,
                url: `https://www.youtube.com/watch?v=${id}`
            };
        });

        return cleaned;

    } catch (err) {
        console.error("YTMusic search error:", err.message);
        return [];
    }
};

const fetchYTMusicTracksByIds = async (ids = []) => {

    if (!ids.length) return [];

    await initYTMusic();

    try {
        const results = await Promise.allSettled(
            ids.map(id => ytmusic.getSong(id))
        );

        const cleaned = results
            .filter(r => r.status === "fulfilled" && r.value)
            .map(r => {
                const item = r.value;

                return {
                    title: cleanTitle(decodeHTML(item.name)),
                    artist: Array.isArray(item.artist)
                        ? item.artist.map(a => a.name).join(", ")
                        : item.artist?.name || "Unknown",

                    thumbnail: item.thumbnails?.[item.thumbnails.length - 1]?.url || "",
                    videoId: item.videoId,
                    url: `https://www.youtube.com/watch?v=${item.videoId}`
                };
            });

        return cleaned;

    } catch (err) {
        console.error("YTMusic fetch error:", err.message);
        return [];
    }
};

module.exports = { searchYouTubeMusicSongs, fetchYTMusicTracksByIds }