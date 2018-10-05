/**
 * Apify crawler pageFunction for consuming the output of the `fetch_local_events.js` act
 * Produces a list of JSON objects that can be consumed via RSS. This code doesn't executed
 * within this project, it must be copied and pasted into the Apify crawler settings.
 */
function pageFunction(context) {
    const DATE_OPTIONS = { year: 'numeric', month: 'long', day: 'numeric' };
    const $ = context.jQuery;
    const jsonString = $("body > pre").text();
    const events = JSON.parse(jsonString);
    
    const getDescription = function(event) {
        const artistObjects = event.performance.map(function(p) { return p.artist; });
        const artistDescriptions = artistObjects.map(function(a) {
            const artistName = a.displayName;
            if (a.tracked) {
                return artistName + " [Tracked]";
            } else if (a.similarTo) {
                const similarArtistNames = a.similarTo.map(function(x) { return x.displayName });
                const similarArtistsString = similarArtistNames.join(", ");
                return artistName + " [Recommended through " + similarArtistsString + "]";
            } else {
                return artistName;
            }
        });
        const formattedDate = (new Date(event.start.date)).toLocaleDateString("en-US", DATE_OPTIONS);
        const content = [
            formattedDate + " at " + event.venue.displayName + " in " + event.location.city,
            "Line-up: " + artistDescriptions.join(", ")
        ]
        return content.join(". ");
    }
    
    const rssItems = events.map(function(event) {
        return {
            title: event.displayName,
            link: event.uri,
            guid: event.uri.split("?")[0],
            description: getDescription(event)
        }
    });
    
    return rssItems;
}
