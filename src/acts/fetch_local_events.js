const Apify = require("apify");
const typeCheck = require('type-check').typeCheck;
const Songkick = require("../songkick").Songkick;
const { SONGKICK_DATA_STORE_ID, ARTISTS_KEY, EVENTS_KEY } = require("./constants");

/**
 * Get a list of metro areas tracked by the given username, fetch upcoming event in those
 * metro areas, then save any events for the user's artists and similar artists.
 * 
 * It reads the key `artists` in the key-value store `songkick-data` to get a list of artists
 * tracked by the user, and all artists similar to those artists. Read the documentation in 
 * `fetch_tracked_and_similar_artists.js` for a description of the JSON format.
 * 
 * The output is stored in the `events` key in the key-value store `songkick-data`. The data
 * takes the following format:
 * 
 * {
 *     "username": "user1",
 *     "events": [
 *         ...
 *     ]
 * }
 */

export async function runFetchLocalEvents() {
    const API_KEY = process.env.SONGKICK_API_KEY;
    if (API_KEY === undefined) {
        throw new Error("Environment variable SONGKICK_API_KEY is required");
    }

    const songkickDataStore = await Apify.openKeyValueStore(SONGKICK_DATA_STORE_ID);
    const artists = await songkickDataStore.getValue(ARTISTS_KEY);

    const songkick = new Songkick(API_KEY);
    const result = await songkick.getLocalEventsForArtists(artists);
    
    await songkickDataStore.setValue(EVENTS_KEY, result);
    await Apify.setValue("OUTPUT", { resultStatus: "SUCCESS" });
};
