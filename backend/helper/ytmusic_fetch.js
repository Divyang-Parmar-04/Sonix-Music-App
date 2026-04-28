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

const formatYTMusicSong = (item) => ({

    title: cleanTitle(decodeHTML(item.name)),

    artist: Array.isArray(item.artist)
        ? item.artist.map(a => a.name).join(", ")
        : item.artist?.name || "Unknown",

    thumbnail:
        item.thumbnails?.[item.thumbnails.length - 1]?.url || "",

    videoId: item.videoId,

    url: `https://www.youtube.com/watch?v=${item.videoId}`
});

const getYTmusicTrending = async () => {
    await initYTMusic();

    const results = await ytmusic.search("trending songs india 2026");

    return results
        .filter(item => item.type === "SONG")
        .slice(0, 10)
        .map(formatYTMusicSong);
};

const getYTmusicNewReleases = async () => {
    await initYTMusic();

    const results = await ytmusic.search("latest hindi song 2026");

    return results
        .filter(item => item.type === "SONG")
        .slice(0, 6)
        .map(formatYTMusicSong);
};

const getYTmusicTopSongs = async () => {
    await initYTMusic();

    const results = await ytmusic.search("top hindi songs");

    return results
        .filter(item => item.type === "SONG")
        .slice(0, 6)
        .map(formatYTMusicSong);
};

module.exports = {getYTmusicNewReleases,getYTmusicTopSongs,getYTmusicTrending}