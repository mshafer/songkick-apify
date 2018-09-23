import 'babel-polyfill';
const Apify = require("apify");
import { runFetchTrackedAndSimilarArtists } from "./acts/fetch_tracked_and_similar_artists";

const ACT_NAME = process.env.ACT_NAME;
let actFunction;

if (ACT_NAME == "fetch-similar-songkick-artists") {
    actFunction = runFetchTrackedAndSimilarArtists;
} else {
    throw new Error(`Unknown ACT_NAME ${ACT_NAME}`);
}

Apify.main(actFunction);
