const axios = require('axios')
const { parseDuration, getCurrentYTKey, switchRapidAPIKey, RP_API_KEYS_LENGTH, YT_API_KEYS_LENGTH, switchYTKey, getCurrentRapidAPIKey } = require("./common");


const fetchMp3Link = async (videoId, retries = RP_API_KEYS_LENGTH) => {

    try {
        const response = await axios.request({
            method: 'GET',
            url: 'https://youtube-mp36.p.rapidapi.com/dl',
            params: { id: videoId },
            headers: {
                'x-rapidapi-key': getCurrentRapidAPIKey(),
                'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
            }
        });

        const data = response.data;

        if (data.status === "ok") {
            return data.link;
        }

        if (data.status === "processing") {
            await new Promise(res => setTimeout(res, 1000));
            return fetchMp3Link(videoId, retries);
        }

        throw new Error(data.msg || "Conversion failed");

    } catch (error) {
        const msg = error.response?.data?.message || error.message;

        console.log("RapidAPI Error:", msg);

        //  Detect quota / limit / forbidden
        if (
            retries > 1 &&
            (
                msg.includes("quota") ||
                msg.includes("limit") ||
                msg.includes("exceeded") ||
                error.response?.status === 403 ||
                error.response?.status === 429
            )
        ) {
            switchRapidAPIKey();
            return fetchMp3Link(videoId, retries - 1);
        }

        throw error;
    }
};

// const youTubeFetch = async (videoId, retries = YT_API_KEYS_LENGTH) => {

//      if (retries <= 1) {
//         console.log("All YT API keys exhausted");
//         return null;
//     }

//     try {
//         const ytRes = await axios.get(
//             "https://www.googleapis.com/youtube/v3/videos",
//             {
//                 params: {
//                     part: "contentDetails",
//                     id: videoId,
//                     key: getCurrentYTKey()
//                 }
//             }
//         );

//         return ytRes

//     } catch (err) {
//         console.error("YouTube API Error:", err.response?.data || err.message);

//         if (
//             err?.error?.code === 403 &&
//             err?.error?.message?.includes("quota")
//         ) {
//             if (retries > 1) {
//                 switchYTKey();
//                 return youTubeFetch(videoId, retries - 1);
//             }
//         }

//         throw error;
//     }
// }

const handleStreamSong = async (videoId) => {
    try {

        // //  1. Get duration
        // const ytRes = await youTubeFetch(videoId)

        // let duration = 0

        // if (ytRes) {
        //     const durationISO =
        //         ytRes.data.items?.[0]?.contentDetails?.duration;

        //     duration = parseDuration(durationISO);
        // }

        // 2. Get MP3 link (SMART ROTATION)
        const finalAudioUrl = await fetchMp3Link(videoId);

        return { finalAudioUrl, duration: 0 };

    } catch (err) {
        console.log("STREAM ERROR:", err.message);
        return { finalAudioUrl: null, duration: 0 };
    }
};


module.exports = { handleStreamSong }