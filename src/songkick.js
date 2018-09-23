const SongkickApiNode = require('songkick-api-node');

export class Songkick {
    constructor(songkickApiKey) {
        this.songkickApi = new SongkickApiNode(songkickApiKey);
        this.pageSize = 50;
    }

    async getSimilarArtists(artists) {
        const artistIds = artists.map(a => a.id).slice(0, 3);
        const similarArtistsById = {};
        for (let artistId of artistIds) {
            console.log(`Fetching artists similar to artist ${artistId}`);
            const similarArtistsRaw = await this.songkickApi.getArtistSimilar(artistId);
            const similarArtists = similarArtistsRaw.map(this._pruneArtistObject);
            console.log(`Fetched ${similarArtists.length} artists similar to artist ${artistId}`);
            for (const similarArtist of similarArtists) {
                if (!similarArtistsById.hasOwnProperty(similarArtist.id)) {
                    similarArtistsById[similarArtist.id] = similarArtist;
                    similarArtistsById[similarArtist.id].similarTo = [artistId];
                } else {
                    similarArtistsById[similarArtist.id].similarTo.push(artistId);
                }
            }
        }
        return Object.keys(similarArtistsById).map(k => similarArtistsById[k]);
    }
    
    async getSimilarArtistsForUser(username) {
        console.log(`Fetching artists tracked by username: ${username}`);
        const trackedArtists = await this._getUserTrackedArtistsAllPages(username);
        console.log(`Fetched ${trackedArtists.length} artists tracked by ${username}`);
        console.log(`Fetching artists similar to tracked artists`);
        const recommendedArtists = await this.getSimilarArtists(trackedArtists);
        console.log(`Fetched ${recommendedArtists.length} artists similar to tracked artists`);
        const result = {
            username,
            trackedArtists: trackedArtists.map(this._pruneArtistObject),
            recommendedArtists
        };
        return result;
    }

    async _getUserTrackedArtistsAllPages(username) {
        const allArtists = [];
        let currentPage = 1;
        let pageIsEmpty = false;
        do {
            const params = {
                page: currentPage,
                per_page: this.pageSize
            };
            console.log(`Fetching page ${currentPage} of tracked artists for username ${username}`);
            const response = await this.songkickApi.getUserTrackedArtists(username, params);
            pageIsEmpty = response === undefined; 
            if (!pageIsEmpty) {
                console.log(`Adding ${response.length} entries to allArtists`);
                allArtists.push(...response);
            }
            currentPage += 1;
        } while (!pageIsEmpty);
        console.log(`No more pages available. Fetched ${allArtists.length} tracked artists`);
        return allArtists;
    }

    /**
     * Return a select set of properties from an Artist object
     * 
     * @param {any} artist 
     */
    _pruneArtistObject({ id, displayName, uri, onTourUntil }) {
        return {
            id,
            displayName,
            uri,
            onTourUntil
        }
    }
}
