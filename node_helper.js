/* Magic Mirror
 * Module: MMM-RocketLeagueZ
 *
 * By Oliver Petersen, https://github.com/Zebrakadebra
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const axios = require('axios');

module.exports = NodeHelper.create({
	start: function() {
		console.log('Starting node_helper for: ' + this.name);
	},

	getStat: function(baseURL) {
		return axios.get(baseURL)
			.catch((error) => {
				console.log(error + ' during axios get from ' + baseURL);
			});
	},

	getStats: function(payload) {
		let gamers = payload.gamers;
		let baseURL = payload.baseURL;
		let promises = [];

		let stats = [];

		gamers.forEach((gamer) => {
			const userURL = baseURL + gamer + '?';
			promises.push(this.getStat(userURL));
		});

		Promise.all(promises)
			.then((gamers) => {
				gamers.forEach((gamer) => {
					const gamertag = gamer.data.data.platformInfo.platformUserIdentifier;
					const segments = gamer.data.data.segments;
					let playlists = [];

					segments.forEach((segment) => {
						if (segment.type == 'playlist') {
							let divNo = segment.stats.division.metadata.name;
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
							
							const playlist = {
								name: segment.metadata.name,
								rankName: segment.stats.tier.metadata.name,
								iconURL: segment.stats.tier.metadata.iconUrl,
								divisionNumber: divNo,
								rankValue: segment.stats.rating.value
							};
							playlists.push(playlist);
						}
					});
					console.log(gamertag + ':' + playlists.length);
					const stat = [gamertag, playlists];
					stats.push(stat);
				});
				console.log('stats:' + stats.length);
				this.sendSocketNotification('STATS_RESULT', {identifier: this.identifier, stats: stats} );
			})
			.catch((error) => {
				console.log(error);
			});
	},

	// Listens to notifications from client (from MMM-RocketLeagueZ.js).
	socketNotificationReceived: function(notification, payload) {
		if (notification === 'GET_STATS') {
			console.log('node_helper of ' + this.name + ' received GET_STATS socket notification');
			this.getStats(payload);
		}
	}

});