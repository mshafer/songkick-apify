const Apify = require("apify");
const typeCheck = require('type-check').typeCheck;
const Songkick = require("../songkick").Songkick;
const { SONGKICK_DATA_STORE_ID, ARTISTS_KEY } = require("./constants");

/**
 * Given a songkick username, fetch the artists they track, and all similar artists.
 * The output is written to the key `artists` in the key-value store `songkick-data`.
 * The data takes the following format:
 * 
 * {
 *     username: "user1"
 *     trackedArtists: [
 *         { 
 *             <standard Songkick artist properties> 
 *         },
 *         ...
 *     ],
 *     recommendedArtists: [
 *         {
 *             <standard Songkick artist properties>,
 *             similarTo: [ <list of artists IDs they matched on> ]
 *         },
 *         ...
 *     ]
 * }
 */

const INPUT_TYPE = `{
    username: String
}`;

export async function runFetchTrackedAndSimilarArtists() {
    const input = await Apify.getValue('INPUT');
    if (!typeCheck(INPUT_TYPE, input)) {
        console.log('Expected input:');
        console.log(INPUT_TYPE);
        console.log('Received input:');
        console.dir(input);
        throw new Error('Received invalid input');
    }

    const API_KEY = process.env.SONGKICK_API_KEY;
    if (API_KEY === undefined) {
        throw new Error("Environment variable SONGKICK_API_KEY is required");
    }

    const songkick = new Songkick(API_KEY);
    const result = await songkick.getSimilarArtistsForUser(input.username);
    const songkickDataStore = await Apify.openKeyValueStore(SONGKICK_DATA_STORE_ID);
    await songkickDataStore.setValue(ARTISTS_KEY, result);
    await Apify.setValue('OUTPUT', { resultStatus: "SUCCESS", input });
};
