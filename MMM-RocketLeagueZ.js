/* Magic Mirror
 * Module: MMM-RocketLeagueZ
 *
 * By Oliver Petersen, https://github.com/Zebrakadebra
 * MIT Licensed.
 */

Module.register('MMM-RocketLeagueZ', {
	// default configuration
	defaults: {
		platforms: ['xbl','xbl','xbl','xbl'],
		gamertags: ['SkillKiddo','RauRauBeck','BarbieBasil','DoriBombino'],
		showPlaylists: ['Un-Ranked','Ranked Duel 1v1','Ranked Doubles 2v2','Ranked Standard 3v3','Tournament Matches'],
		sortBy: 'gamertag', //'gamertag' ascending or 'Un-Ranked' descending or 'Single' descending or 'Double' descending or 'Standard' descending or 'Tournament' descending
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

			Console.log(this.name + ': STATS_RESULT SocketNotification received');
			this.stats = payload.stats;
			
			for (let i = 0; i < this.stats.length; ++i) {	
				Console.log(this.name + ': for gamertag ' + this.stats[i].gamertag);
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
			return wrapper;
		}

		console.log('node_helper of ' + this.name + ' extracts playlist ' + playlist.name + ' for gamertag ' + gamertag);

		wrapper.className = 'bright xsmall';

		let headerRow = document.createElement('tr');
		headerRow.className = 'normal header-row';

		this.createTableCell(headerRow, this.translate('gamertag'), 'gamertag-header', 'left');
		this.createTableCell(headerRow, this.translate(this.config.showPlaylists[0]), 'un-ranked-header', 'center');
		this.createTableCell(headerRow, this.translate(this.config.showPlaylists[1]), 'level-header', 'center');
		this.createTableCell(headerRow, this.translate(this.config.showPlaylists[2]), 'level-header', 'center');
		this.createTableCell(headerRow, this.translate(this.config.showPlaylists[3]), 'level-header', 'center');
		this.createTableCell(headerRow, this.translate(this.config.showPlaylists[4]), 'level-header', 'center');
		wrapper.appendChild(headerRow);

		for (let i = 0; i < this.stats.length; ++i) {
			let row = document.createElement('tr');
			row.className = 'normal bright stats-row';
			
			const stat = this.stats[i];
			this.createTableCell(row, stat.gamertag, 'gamertag', 'left');
			for (let j = 0; j < this.config.showPlaylists.length; ++j) {
				
				for (let k = 0; k < this.stat.playlists.length; ++k) {
					const playlist = this.stat.playlists[k];

					if (playlist.name === this.config.showPlaylists[j]) {
						this.createRankTableCell(row, playlist.iconURL, playlist.rankName, playlist.divisionNumber, playlist.ratingValue, this.translate(playlist.name), 'center');
					}
				}
			}
			wrapper.appendChild(row);
		}

		return wrapper;
	},

	// Override start to init stuff.
	start: function() {
		this.stats = null;
		Console.log(this.name + ': Modul started');

		// Tell node_helper to load stats at startup.
		this.sendSocketNotification('GET_STATS', { identifier: this.identifier,
												   platforms: this.config.platforms,
		                                           gamertags: this.config.gamertags,
		                                           sortBy: this.config.sortBy });
		Console.log(this.name + ': GET_STATS SocketNotification sent');
		
		// Make sure stats are reloaded at user specified interval.
		let interval = Math.max(this.config.fetchInterval, 1000);  // In millisecs. < 1 min not allowed.
		let self = this;
		setInterval(function() {
			self.sendSocketNotification('GET_STATS', { identifier: self.identifier,
			                                           platforms: self.config.platforms,
													   gamertags: self.config.gamertags,
		                                               sortBy: self.config.sortBy });
		}, interval); // In millisecs.
		Console.log(this.name + ': SocketNotification interval set');
		Console.log(this.name + ': waiting for reply from node_helper');		
	},

	// Creates a table row cell.
	// @param row - The table row to add cell to.
	// @param iconURL - The iconURL of the img to show.
	// @param rankName - The rankName to show.
	// @param divisionNumber - The divisionNumber to show.
	// @param ratingValue - The ratingValue to show.
	createRankTableCell: function(row, iconURL, rankName, divisionNumber, ratingValue, className, align)
	{
		const text = "<img src='" + iconURL + "' width=20px height=20px alt='" + rankName + "'/>" + new Intl.NumberFormat().format(divisionNumber) + "/" + new Intl.NumberFormat().format(ratingValue);
		this.createTableCell(row, text, className, align);
	},

	// Creates a table row cell.
	// @param row - The table row to add cell to.
	// @param text - text to show.
	// @param align - text align: 'left', 'center' or 'right'.
	createTableCell: function(row, text, className, align = 'left')
	{
		let cell = document.createElement('td');
		cell.innerHTML = text;
		cell.className = className;

		cell.style.cssText = 'text-align: ' + align + ';';

		row.appendChild(cell);
	}
});