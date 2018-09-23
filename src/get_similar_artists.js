import 'babel-polyfill';
import * as fs from "fs";
import { Songkick } from "./songkick";

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

function main() {
    if (process.argv.length < 3) {
        const usageMessage = `Usage: node ${process.argv[1]} <songkick_username>`;
        throw new Error(`Invalid number of arguments provided to program.\n${usageMessage}`);
    }
    const API_KEY = process.env.SONGKICK_API_KEY;
    if (API_KEY === undefined) {
        throw new Error("Environment variable SONGKICK_API_KEY is required");
    }
    const songkick = new Songkick(API_KEY);
    const username = process.argv[2];
    songkick.getSimilarArtistsForUser(username).then(result => {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result));
    });
}

if (require.main === module) {
    main();
}
