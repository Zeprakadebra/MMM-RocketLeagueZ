# Beschreibung
Dieses MichMich MagicMirror Modul namens MMM-RocketLeagueZ zeigt plattformübergreifend Statusinformationen (Rang,Liga,MMR) des bekannten Computerspiels Rocket League für vordefinierte Playlists von x-beliebig hinterlegten gamertags an.
Als Datenquelle verwendet das Modul eine JSON-URL vom Rocket League Tracker Network.
Die JSON-URL gibt alle verfügbaren Informationen eines gamertags in Form eines Datenstroms zurück. Das Modul durchsucht diesen Datenstrom und liest daraus ausgewählte Statusinformationen aus, baut ein DOM-Objekt auf und zeigt dieses im MagicMirror als html-Tabelle an.
Dieser Vorgang wird regelmäßig wiederholt.
Anmerkung:
Das Z im Modulnamen steht für meinen Github-Usernamen (=Zebrakadebra). Diese Ergänzung war erforderlich, da es schon einmal ein RocketLeague Modul von einem anderen Githuber gab. Das Modul funktionierte offensichtlich nicht mehr und wurde von auf Github entfernt. Um Verwechselungen zu vermeiden habe ich vorsorglich mein Modulnamen mit der Erweiterung Z eindeutig deklariert. 