/**
 * Apify crawler pageFunction for consuming the output of the `fetch_local_events.js` act
 * Produces a list of JSON objects that can be consumed via RSS.
 */
function pageFunction(context) {
    const $ = context.jQuery;
    const jsonString = $("body > pre").text();
    const events = JSON.parse(jsonString);
    
    const rssItems = events.map(function(e) {
        const artistObjects = e.performance.map(function(p) { return p.artist; });
        const artistDescriptions = artistObjects.map(function(a) {
            const artistName = a.displayName;
            if (a.tracked) {
                return artistName + " [Tracked]";
            } else if (a.similarTo) {
                return artistName + " [Recommended]";
            } else {
                return artistName;
            }
        });
        return {
            title: e.displayName,
            link: e.uri,
            guid: "http://www.songkick.com/concerts/" + e.id,
            content: "Line-up: " + artistDescriptions.join(", ") + ". Venue: " + e.venue.displayName
        }
    });
    
    return rssItems;
}
