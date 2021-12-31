/* Magic Mirror
 * Module: MMM-RocketLeagueZ
 *
 * By Oliver Petersen, https://github.com/Zebrakadebra
 * MIT Licensed.
 */

Module.register('MMM-RocketLeagueZ', {
	// default configuration
	defaults: {
        baseURL: 'https://api.tracker.gg/api/v2/rocket-league/standard/profile/',
        gamers: [
            'xbl/SkillKiddo', 
            'xbl/RauRauBeck', 
            'xbl/BarbieBasil', 
            'xbl/DoriBombino'
        ],
		playlists: [
            'Un-Ranked',
            'Ranked Duel 1v1',
            'Ranked Doubles 2v2',
            'Ranked Standard 3v3',
            'Tournament Matches'
        ],
		fetchInterval: 10*60*1000 // in milliseconds. default every ten minutes
	},

	getStyles: function() {
		return [ 'modules/MMM-RocketLeagueZ/MMM-RocketLeagueZ.css' ];
	},

	getTranslations: function () {
		return {
			en: 'translations/en.json',
		    de: 'translations/de.json'
		}
	},

	// Notification from node_helper.js.
	// The stats is received here. Then module is redrawn.
	// @param notification - Notification type.
	// @param payload - Contains an array of user stats. Each item in the array contains gamertag / playlistName / rankName / iconURL / divisionName / ratingValue.
	socketNotificationReceived: function(notification, payload) {

		if (notification === 'STATS_RESULT') {
			if (null == payload)
				return;

			if (null == payload.identifier)
				return;

			if (payload.identifier !== this.identifier)  // To make sure the correct instance is updated, since they share node_helper.
				return;

			if (null == payload.stats)
				return;

			if (0 === payload.stats.length)
				return;

			console.log(this.name + ': STATS_RESULT SocketNotification received');
			this.stats = payload.stats;
			console.log(this.name + ': STATS:' + JSON.stringify(this.stats));
			console.log(this.name + ': STATS_COUNT:' + this.stats.length);
			
			for (let i = 0; i < this.stats.length; ++i) {	
				console.log(this.name + ': for gamertag ' + this.stats[i].gamertag);
			}
			this.updateDom(0);
		}
	},

	// Override dom generator.
	getDom: function () {
		let wrapper = document.createElement('table');
		if (null == this.stats) {
			wrapper.innerHTML = this.translate('LOADING');
			wrapper.className = 'loading dimmed xsmall';
		} else {
            wrapper.innerHTML = 'ready';
			wrapper.className = 'loading dimmed xsmall';
        }
		return wrapper;
	},

	// Override start to init stuff.
	start: function() {
		this.stats = null;
		console.log(this.name + ': Modul started');

		// Tell node_helper to load stats at startup.
		this.sendSocketNotification('GET_STATS', { identifier: this.identifier, baseURL: this.config.baseURL, gamers: this.config.gamers });
		console.log(this.name + ': GET_STATS SocketNotification sent');
		
		// Make sure stats are reloaded at user specified interval.
		let self = this;
		setInterval(function() {self.sendSocketNotification('GET_STATS', { identifier: self.identifier, baseURL: self.config.baseURL, gamers: self.config.gamers });}, Math.max(self.config.fetchInterval, 1000)); // In millisecs.
		console.log(this.name + ': SocketNotification interval set');
		console.log(this.name + ': waiting for reply from node_helper');		
	}
});