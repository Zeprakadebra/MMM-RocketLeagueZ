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

	getStat: function(userURL) {
		return axios.get(userURL)
			.catch((error) => {
				console.log('node_helper of ' + this.name + ' ' + error + ' during axios get from ' + userURL);
			});
	},

	sendStats: function(payload) {
		let identifier = payload.identifier;
		let gamers = payload.gamers;
		let baseURL = payload.baseURL;

		let promises = [];

		gamers.forEach((gamer) => {
			const userURL = baseURL + gamer + '?';
			promises.push(this.getStat(userURL));
		});

		let stats = [];

		Promise.all(promises)
			.then((gamers) => {
				gamers.forEach((gamer) => {
					const gamertag = gamer.data.data.platformInfo.platformUserIdentifier;
					const segments = gamer.data.data.segments;
					const avatarURL = gamer.data.data.platformInfo.avatarUrl;

					console.log(avatarURL);

					let playlists = [];

					segments.forEach((segment) => {
						if (segment.type == 'playlist') {

							const playlist = {
								name: segment.metadata.name,
								rankName: segment.stats.tier.metadata.name,
								divisionNumber: segment.stats.division.metadata.name,
								iconURL: segment.stats.tier.metadata.iconUrl,
								rankValue: segment.stats.rating.value
							};

							playlists.push(playlist);
						}
					});

					const stat = {
						gamertag: gamertag,
						avatarURL: avatarURL,
						playlists: playlists
					};

					stats.push(stat);
				});

				console.log('node_helper of ' + this.name + ' sending STATS_RESULT including ' + stats.length + ' stats.');
				this.sendSocketNotification('STATS_RESULT', {identifier: identifier, stats: stats} );
			})
			.catch((error) => {
				console.log('node_helper of ' + this.name + ':' + error + ' during axios promise receiption');
			});
	},

	// Listens to notifications from client (from MMM-RocketLeagueZ.js).
	socketNotificationReceived: function(notification, payload) {
		if (notification === 'GET_STATS') {
			console.log('node_helper of ' + this.name + ' received GET_STATS socket notification');
			this.sendStats(payload);
		}
	}

});