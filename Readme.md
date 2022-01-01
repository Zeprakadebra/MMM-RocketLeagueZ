# Documentation
This MagicMirror2 module named MMM-RocketLeagueZ displays cross-platform stats (rank,MMR) of the popular computer game Rocket League.

You can choose for which gamertags and platforms you want to get stats.

![RocketLeagueZ_png](https://github.com/Zeprakadebra/MMM-RocketLeagueZ/blob/master/MMM-RocketLeagueZ.PNG)

# Install
1. Change the directory to MagicMirror/modules: ```$ cd MagicMirror/modules```
2. Clone this repo: ```$ git clone https://github.com/Zeprakadebra/MMM-RocketLeagueZ```
3. List the contents of MagicMirror/modules to make sure that MMM-RocketLeagueZ was cloned: ```$ ls```
4. Change the directory to MagicMirror/config: ```$ cd ~/MagicMirror/config```
5. Modify your config.js file and add the MMM-RocketLeagueZ module: ```$ sudo nano config.js```
    
# Config Settings
The basic config should look like this

```
{
    module: "MMM-RocketLeagueZ",
    position: "top_center",
    config: {}
},
 ```
If everything runs as expected you can customize the config param based on the table below.

<table>
<tr>
<th>Param</th>
<th>Default Value</th>
<th>Type</th>
<th>Definition</th>
</tr>

<tr>
<td>gamers</td>
<td>-</td>
<td>Array of str</td>
<td>This param array is used to define the gamertags and platform to get the stats for. The array consists of string pairs of a platform code followed by a gamertag seperated by '/', e.c. 'xbl/foo'. Following platform codes are available: xbl = XBOX, psn = PLAYSTATION, steam = STEAM, epic = EPIC, switch = NINTENTO. </td>
</tr>

<tr>
<td>baseURL</td>
<td>https://api.tracker.gg/api/v2/rocket-league/standard/profile/</td>
 <td>str</td>
<td>This is the api to fetch stats from.</td>
</tr>

<tr>
<td>fetchInterval</td>
<td>600000</td>
 <td>int</td>
<td>This is how frequently you want to fetch stats from the baseURL.</td>
</tr>

<tr>
<td>rotateInterval</td>
<td>10000</td>
<td>int</td>
<td>This is how frequently you want to rotate through the different playlists</td>
</tr>

<tr>
<td>animationSpeed</td>
<td>400</td>
<td>int</td>
<td>This is how fast you want to animate between playlist rotation </td>
</tr>