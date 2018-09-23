import 'babel-polyfill';
const Apify = require("apify");
const typeCheck = require('type-check').typeCheck;
const Songkick = require("../songkick").Songkick;

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

Apify.main(async () => {
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
    const store = await Apify.openKeyValueStore('songkick-data');
    await store.setValue("artists", result);
    await Apify.setValue('OUTPUT', { resultStatus: "SUCCESS", input });
});
