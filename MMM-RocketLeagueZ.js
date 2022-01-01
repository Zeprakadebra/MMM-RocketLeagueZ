/* Magic Mirror
 * Module: MMM-RocketLeagueZ
 *
 * By Oliver Petersen, https://github.com/Zebrakadebra
 * MIT Licensed.
 */

Module.register('MMM-RocketLeagueZ', {
	// default configuration
	defaults: {
		header: 'Haleluja',
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
		fetchInterval: 10*60*1000,
		fetchIntervalMin: 60*1000, 
		rotateInterval: 10*1000,
		rotateIntervalMin: 2*1000,
		animationSpeed: 400
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

	getHeader: function() {
		return this.data.header + ' ' + this.translate(this.config.playlists[this.currentPlaylist]);
	},

	// Notification from node_helper.js.
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

			this.stats = payload.stats;
		}
	},

	// Override dom generator.
	getDom: function () {
		let wrapper = document.createElement('table');
		if (null == this.stats) {
			wrapper.innerHTML = this.translate('LOADING');
			wrapper.className = 'loading dimmed xsmall';
		} else {
			this.currentPlaylist = this.currentPlaylist == this.config.playlists.length - 1 ? 0 : this.currentPlaylist + 1;
			let gamers = [];
			console.log(this.name + ': gamer stats rendering for playlist ' + this.translate(this.config.playlists[this.currentPlaylist]));
			this.stats.forEach((stat) => {
				stat.playlists.forEach((playlist) => {
					if (playlist.name == this.config.playlists[this.currentPlaylist]) {
						let gamer = {
							tag: stat.gamertag,
							avatarURL: stat.avatarURL,
							rankName: playlist.rankName,
							divisionNumber: this.translate(playlist.divisionNumber),
							iconURL: playlist.iconURL,
							rankValue: playlist.rankValue,
						}
						gamers.push(gamer);
					}
				});
			});
			gamers.sort((a, b) => {
				return b.rankValue - a.rankValue;
			});

			
			gamers.forEach((gamer) => {

				let row = document.createElement('tr');
					row.className = 'normal bright stats-row';

				let cell = document.createElement('td');
					cell.rowSpan = 2;
					cell.innerHTML = "<img src='" + gamer.avatarURL + "' width=100px height=100px alt='" + gamer.tag + "'/>"  
					cell.style.cssText = 'text-align: left;';
					row.appendChild(cell);
			
					cell = document.createElement('td');
					cell.rowSpan = 2;
					cell.innerHTML = gamer.tag;  
					cell.style.cssText = 'text-align: left;';
					row.appendChild(cell);

					cell = document.createElement('td');
					cell.innerHTML = gamer.rankValue;  
					cell.style.cssText = 'text-align: right;';
					row.appendChild(cell);

					cell = document.createElement('td');
					cell.rowSpan = 2;
					cell.innerHTML = "<img src='" + gamer.iconURL + "' width=100px height=100px alt='" + gamer.rankName + "'/>"  
					cell.style.cssText = 'text-align: left;';
					row.appendChild(cell);
					wrapper.appendChild(row);

					row = document.createElement('tr');
					row.className = 'normal bright stats-row';

					cell = document.createElement('td');
					cell.innerHTML = gamer.divisionNumber;  
					cell.style.cssText = 'text-align: right;';
					row.appendChild(cell);
					wrapper.appendChild(row);

				console.log(gamer.tag + ': ' + gamer.rankName + '/' + gamer.divisionNumber + ' => ' + gamer.rankValue + ' = ' + gamer.avatarURL);
			});
        }
		return wrapper;
	},

	createRankTableCell: function(row, iconURL, rankName, divisionNumber, ratingValue, className, align)
	{
		const text = "<img src='" + iconURL + "' width=20px height=20px alt='" + rankName + "'/>" + new Intl.NumberFormat().format(divisionNumber) + "/" + new Intl.NumberFormat().format(ratingValue);
		this.createTableCell(row, text, className, align);
	},

	createTableCell: function(row, text, className, align = 'left')
	{
		let cell = document.createElement('td');
		cell.innerHTML = text;
		cell.className = className;

		cell.style.cssText = 'text-align: ' + align + ';';

		row.appendChild(cell);
	},

	// Override start to init stuff.
	start: function() {
		this.stats = null;
		this.currentPlaylist = 0;

		console.log(this.name + ': Modul started');

		// Tell node_helper to load stats at startup.
		this.sendSocketNotification('GET_STATS', { 
			identifier: this.identifier, 
			baseURL: this.config.baseURL, 
			gamers: this.config.gamers
		});
		
		console.log(this.name + ': GET_STATS SocketNotification sent');
		
		// Make sure stats are reloaded at user specified interval.
		let self = this;
		setInterval(function() {
			self.updateDom(self.config.animationSpeed); 
		}, Math.max(self.config.rotateInterval, self.config.rotateIntervalMin));		
		
		setInterval(function() {
			self.sendSocketNotification('GET_STATS', { 
				identifier: self.identifier, 
				baseURL: self.config.baseURL, 
				gamers: self.config.gamers 
			});
		}, Math.max(self.config.fetchInterval, self.config.fetchIntervalMin));
		
			console.log(this.name + ': SocketNotification interval set');
		console.log(this.name + ': waiting for reply from node_helper');		
	}
});