import * as Songkick from "songkick-api-node";
import * as fs from 'fs';

/**
 * Given a songkick username, fetch the artists they track, and all similar artists.
 * The output is written to artists.json, taking the following format:
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

const OUTPUT_FILE = "artists.json";
const API_KEY = process.env.SONGKICK_API_KEY;
const songkickApi = new Songkick(API_KEY);

function sleep (time) {
    console.log(`Sleeping for ${time}ms`);
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function getSimilarArtists(artists) {
    const artistIds = artists.map(a => a.id);
    const similarArtistsById = {};
    for (let artistId of artistIds) {
        const similarArtists = songkickApi.getArtistSimilar(artistId);
        for (const similarArtist of similarArtists) {
            if (!similarArtistsById.hasOwnProperty(similarArtist.id)) {
                similarArtistsById[similarArtist.id] = similarArtist;
                similarArtistsById[similarArtist.id].similarTo = [artist.id];
            } else {
                similarArtistsById[similarArtist.id].similarTo.push(artist.id);
            }
        }
    }
    return similarArtistsById.values();
}

export async function getSimilarArtistsForUser(username) {
    const trackedArtists = songkickApi.getUserTrackedArtists(username);
    const recommendedArtists = await getSimilarArtists(trackedArtists);
    const result = {
        username,
        trackedArtists,
        recommendedArtists
    };
    return result;
}

// In case we want to run this at the command-line
async function main() {
    if (process.argv.length < 3) {
        console.error(`Usage: node ${process.argv[1]} <songkick_username>`);
        throw new Error("Invalid number of arguments provided to program");
    }
    const username = process.argv[2];
    const result = getSimilarArtistsForUser(username);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result));
}

if (require.main === module) {
    await main();
}
