const SongkickApiNode = require('songkick-api-node');

export class Songkick {
    constructor(songkickApiKey) {
        this.songkickApi = new SongkickApiNode(songkickApiKey);
        this.pageSize = 50;
    }
    
    async getSimilarArtistsForUser(username) {
        console.log(`Fetching artists tracked by username: ${username}`);
        const trackedArtists = await this._getUserTrackedArtistsAllPages(username);
        console.log(`Fetched ${trackedArtists.length} artists tracked by ${username}`);
        console.log(`Fetching artists similar to tracked artists`);
        const recommendedArtists = await this._getSimilarArtists(trackedArtists);
        console.log(`Fetched ${recommendedArtists.length} artists similar to tracked artists`);
        const result = {
            username,
            trackedArtists: trackedArtists.map(this._pruneArtistObject),
            recommendedArtists
        };
        return result;
    }

    async getLocalEventsForArtists(artists) {
        console.log(`Fetching metro areas tracked by username: ${artists.username}`);
        const metroAreas = await this.songkickApi.getUserTrackedMetroAreas(artists.username);
        console.log(`Fetched ${metroAreas.length} metro areas tracked by ${artists.username}`);
        const allEvents = [];
        for (let metroArea of metroAreas) {
            const events = await this._getLocationUpcomingEventsAllPages(metroArea);
            allEvents.push(...events);
        }
        const relevantEvents = this._filterEventsByArtist(allEvents, artists);
        this._labelRelevantArtistsInEvents(relevantEvents, artists);
        return relevantEvents;
    }

    async _getSimilarArtists(artists) {
        const artistIds = new Set(artists.map(a => a.id));
        const similarArtistsById = {};
        for (let artistId of artistIds) {
            console.log(`Fetching artists similar to artist ${artistId}`);
            const similarArtistsRaw = await this.songkickApi.getArtistSimilar(artistId);
            const similarArtists = similarArtistsRaw.map(this._pruneArtistObject);
            console.log(`Fetched ${similarArtistsRaw.length} artists similar to artist ${artistId}`);
            const untrackedSimilarArtists = similarArtists.filter(a => !artistIds.has(a.id));
            console.log(`Keeping ${untrackedSimilarArtists.length} that aren't already tracked by the user`);
            for (const similarArtist of untrackedSimilarArtists) {
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

    async _getLocationUpcomingEventsAllPages(metroArea) {
        const allEvents = [];
        let currentPage = 1;
        let pageIsEmpty = false;
        do {
            const params = {
                page: currentPage,
                per_page: this.pageSize
            };
            console.log(`Fetching page ${currentPage} of events for location ${metroArea.id}:${metroArea.displayName}`);
            const response = await this.songkickApi.getLocationUpcomingEvents(metroArea.id, params);
            pageIsEmpty = response === undefined; 
            if (!pageIsEmpty) {
                console.log(`Adding ${response.length} entries to allEvents`);
                allEvents.push(...response);
            }
            currentPage += 1;
        } while (!pageIsEmpty);
        console.log(`No more pages available. Fetched ${allEvents.length} events for location ${metroArea.id}`);
        return allEvents;
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

    _filterEventsByArtist(events, artists) {
        const allArtists = artists.trackedArtists.concat(artists.recommendedArtists); 
        const relevantArtistIds = new Set(allArtists.map(a => a.id));
        const relevantEvents = events.filter(event => {
            return event.performance.some(p => relevantArtistIds.has(p.artist.id));
        });
        return relevantEvents;
    }

    _labelRelevantArtistsInEvents(events, artists) {
        const trackedArtistsById = {};
        const recommendedArtistsById = {};
        for (let artist of artists.trackedArtists) {
            trackedArtistsById[artist.id] = artist;
        }
        for (let artist of artists.recommendedArtists) {
            recommendedArtistsById[artist.id] = artist;
        } 
        for (let event of events) {
            for (let performance of event.performance) {
                const artistId = performance.artist.id;
                performance.artist.tracked = trackedArtistsById.hasOwnProperty(artistId);
                if (recommendedArtistsById.hasOwnProperty(artistId)) {
                    performance.artist.similarTo = recommendedArtistsById[artistId].similarTo;
                }
            }
        }
    }
}
