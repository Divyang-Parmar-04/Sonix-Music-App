const YTMusic = require("ytmusic-api");

const ytmusic = new YTMusic();

let initPromise = null;

const initYTMusic = async () => {
    if (!initPromise) {
        initPromise = ytmusic.initialize();
    }
    await initPromise;
};

module.exports = { ytmusic, initYTMusic };