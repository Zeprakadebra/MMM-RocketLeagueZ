/* Magic Mirror
 * Module: MMM-RocketLeagueZ
 *
 * By Oliver Petersen, https://github.com/Zebrakadebra
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const rp = require('request-promise');
const baseURL = ' https://api.tracker.gg/api/v2/rocket-league/standard/profile/';

module.exports = NodeHelper.create({
	start: function() {
		console.log('Starting node_helper for: ' + this.name);
	},

	// Extracts JSON into the relevant stats.
	// JSON contains these (amongst others):
	// tbd
	// @param json - The full JSON for the gamertag.
	// @param segNo - The segment number where to take the stats from.
	// @return Object with stats we want to show.
	extractStats: function(json,segNo) {
		const divNo = json.segments[segNo].stats.division.metadata.name;
		switch (divNo) {
			case 'Divison I':
				divNo = '1';
				break;
			case 'Division II':
				divNo = '2';
				break;
			case 'Division III':
				divNo = '3';
				break;
			case 'Division IV':
				divNo = '4';
				break;
			default:
				divNo = '0';
				break;
		}
		
		const playlist = {name: json.segments[segNo].metadata.name,
		                  rankName: json.segments[segNo].stats.tier.metadata.name,
		                  iconURL: json.segments[segNo].stats.tier.metadata.iconUrl,
					      divisionNumber: divNo,
					      rankValue: json.segments[segNo].stats.rating.value};
		return playlist;
	},

	// Gets Rocket League gamertag stats from API and adds them to an array.
	// Each item in the array contains gamertag / playlistName / rankName / iconURL / divisionNumber / rankValue.
	// The stats are the total for the current season and all available playlists.
	// The array is then sent to the client (to MMM-RocketLeagueZ.js).
	// @param platforms - String arraf of platforms. 
	// @param gamertags - String array of gamertags.
	getStats: function(payload) {
		let identifier = payload.identifier;
		let platforms = payload.platforms;
		let gamertags = payload.gamertags;

		let promises = [];
		
		console.log('node_helper of ' + this.name + ' starts with request promise');

		for (let i = 0; i < gamertags.length; ++i) {
			const userURL = baseURL + platforms[i] + '/' + gamertags[i] + '?';
			const options = {uri: userURL};
			promises.push(rp(options));
		}

		console.log('node_helper of ' + this.name + ' sent all request promise');
		
		
		Promise.all(promises).then((contents) => {
			let stats = [];

			for (let i = 0; i < contents.length; ++i) {
				const content = contents[i];
				const json = JSON.parse(content);
				const gamertag = json.platformInfo.platformUserIdentifier;
				
				let playlists = [];
				
				for (let j = 0; j < json.segments.length; ++j) {
					if (json.segments[j].type === 'playlist') {
						const playlist = this.extractPlaylist(json,j);
						console.log('node_helper of ' + this.name + ' extracts playlist ' + playlist.name + ' for gamertag ' + gamertag);
						playlists.push(playlist);
					}
				const stat = [gamertag,playlists],
				stats.push(stat);
				}
			}

			// Always sort by gamertag, rankValue.
			stats.sort((a) => a.gamertag);
			console.log('node_helper of ' + this.name + ' sorted stats');
				
			//if ('level' === payload.sortBy)
			//	stats.sort((a, b) => Number(b.level) - Number(a.level));
			//if ('kills' === payload.sortBy)
			//	stats.sort((a, b) => Number(b.kills) - Number(a.kills));

			this.sendSocketNotification('STATS_RESULT', {identifier: identifier, stats: stats} );
		}).catch(err => {
			console.log(this.name + ' error when fetching data: ' + err);
		});
	},

	// Listens to notifications from client (from MMM-RocketLeagueZ.js).
	// Client sends a notification when it wants download new stats.
	// @param payload - String array of platforms and gamertags.
	socketNotificationReceived: function(notification, payload) {
		if (notification === 'GET_STATS') {
			console.log('node_helper of ' + this.name + ' received GET_STATS socket notification');
			this.getStats(payload);
		}
	}

});