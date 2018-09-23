const SongkickApiNode = require('songkick-api-node');

export class Songkick {
    constructor(songkickApiKey) {
        this.songkickApi = new SongkickApiNode(songkickApiKey);
    }

    async getSimilarArtists(artists) {
        const artistIds = artists.map(a => a.id).slice(0, 3);
        const similarArtistsById = {};
        for (let artistId of artistIds) {
            const similarArtists = await this.songkickApi.getArtistSimilar(artistId);
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
        const trackedArtists = await this.songkickApi.getUserTrackedArtists(username);
        const recommendedArtists = await this.getSimilarArtists(trackedArtists);
        const result = {
            username,
            trackedArtists,
            recommendedArtists
        };
        return result;
    }
}
