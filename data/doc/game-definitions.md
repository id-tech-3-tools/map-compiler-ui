```json
{
	// game id, used within the project
	"gameId": "q3",  
	// game name, displayed in the game selector list
	"gameName": "Q3", 
	// game title
	"gameDescription": "Quake III Arena", 
	// `-game` switch value
	"compilerGameId": "q3", 
	// game icon name
	"gameIcon": "", 
	// base directory name
	"base": "baseq3",
	// suggested home paths, for maps/assets seeking
	"homePaths": [
		{ "platform": "windows", "path": "$homepath\\Documents\\Quake III Arena" }
	],
	// suggested installation paths, for maps/assets seeking
	"installationPaths": [
		{ "platform": "windows", "path": "C:\\Program Files (x86)\\Quake III Arena" },
		{ "platform": "windows", "path": "C:\\Program Files\\Quake III Arena" },
		{ "platform": "windows", "path": "C:\\Quake III Arena" },
		{ "platform": "windows", "path": "C:\\Mapping\\Quake III Arena" },
		{ "platform": "windows", "path": "C:\\Mapping\\Q3Arena" },
		{ "platform": "windows", "path": "C:\\Mapping\\Q3" }
	],
	// suggested engine list for game launcher (w/o extensions)
	"engines": ["ioquake3.x86", "ioquake3.x64", "quake3"],
	// official pak names, these paks will be used to exclude certain files from map packing
	"officialPaks": ["pak0.pk3", "pak1.pk3", "pak2.pk3", "pak3.pk3", "pak4.pk3", "pak5.pk3", "pak6.pk3", "pak7.pk3", "pak8.pk3"],
	// remote console support
	"rcon": true,
	// commands issued by the game launcher
	"engineCommands": {
		// these commands are set on the game start
		"startDevmap": "+devmap $map",
		// these commands sent by the rcon to reload the map in game
		"restartDevmap": "devmap $map",
		// these commands are sent if `devmap` was opted out
		"startMap": "map $map",
		"restartMap": "map $map",
		// these commands are sent by rcon to perform graceful exit when required (eg. stop button was pressed)
		"exit": "quit",
	},
	// engine options added to the game launcher ui and then to final argument list
	"engineOptions" : [
		{ 
			// cvar
			"name": "sv_pure", 
			// option label
			"label": "Pure Server", 
			// option tooltip text
			"title": "Run pure server", 
			// option type: toggle -> checkbox
			"type": "toggle", 
			// values checkbox will switch between
			"values": [0, 1], 
			// default value
			"default": 0 ,
			// noop, but should be always true for such type
			"enabled": true
		},
		{ 
			// cvar
			"name": "sv_fps", 
			// option label
			"label": "Server FPS", 
			// option tooltip text
			"title": "Sets number of frames server runs with", 
			// option type: number -> number field
			"type": "number", 
			// min / max 
			"values": [0, 1], 
			// default value
			"default": 0 ,
			// toggle option
			"enabled": false
		},
		{ 
			// cvar
			"name": "com_hunkmegs", 
			// option label
			"label": "Hunkmegs", 
			// option tooltip text
			"title": "Sets maximum RAM dedicated for a game", 
			// option type: slider -> slider element
			"type": "slider", // or "slider_alt"
			// min/max/step
			"values": [64, 512, 64], // or values to toggle between if slider_alt is used [10, 20, 30, 40] 
			// default value
			"default": 0 ,
			// toggle option
			"enabled": false
		},
		{ 
			// cvar
			"name": "r_trisColor", 
			// option label
			"label": "Tris Color", 
			// option tooltip text
			"title": "Sets tris debug color", 
			// option type: text -> text field
			"type": "text",
			// autocompletion if required
			"values": ["white", "red", "yellow", "green", "black"], 
			// default value
			"default": "white",
			// toggle option
			"enabled": false
		},
		{ 
			// cvar
			"name": "fs_basepath", 
			// option label
			"label": "Base path", 
			// option tooltip text
			"title": "Sets base path", 
			// option type: folder -> folder selector + dialog
			"type": "folder",
			// noop
			"values": [], 
			// noop
			"default": "",
			// toggle option
			"enabled": false
		}
	],
	// suggested compiler list (w/o extensions)
	"compilers": ["mapcompiler", "q3map2"],
	// suggested bspc list (w/o extensions)
	"compilers": ["bspc"],
	// for future references, could handle certain events and act accordingly (eg. include save/load routines on map restarts)
	"script": ""
}
```