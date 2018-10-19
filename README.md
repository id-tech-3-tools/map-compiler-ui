# Q3 Map Compiler UI
> A middleware between map editor and game.

This application is created to provide an easy way to manage, store and edit map compiler presets, as well as compile and test maps. 

## Features
* Gives access to all supported switches by the map compiler and shows their descriptions. 
* Gives ability to quickly test any map, and can automatically restart map after the compilation.
* Has BSPC integration, for games that support it. 
* Supports tasks system, which allows to trigger certain tasks when specific events happen.
* Allows to use multiple game engines, map compilers and BSPCs.
* Allows to create separate map projects with custom settings.
* Can start automatically compilation process on each map change.
* Ships with dozen of standard compiler presets: test, low, medium and high quality.
* Can run multiple launchers in one order on each map compilation: Compiler > BSPC > Game + Tasks
* Gives a quick way to enable/disable certain game options.

*The work is still in progress, APIs and file structures are not yet fully implemented or finalized.*

## Supported games
At that moment only selective pool of games are supported:
* Quake 3 Arena
* Return to Castle Wolfenstein (both SP and MP)
* Wolfenstein: Enemy Territory

However, in future more flexible game definition is planned, so adding new game support will be a much easier process. 

## Screenshot
![Application](../master/data/doc/assets/app.png)

## Documentation
A brief user guide can be found [here](https://github.com/isRyven/map-compiler-ui/blob/master/data/doc/application.md).

## Code editing
* run `yarn` or `npm install`
* run `yarn serve:electron` or `npm run serve:electron`

## Notes
The [switches layout](../master/data/switches-layout.json) is designed around [NetRadiant's Q3Map2](https://github.com/Garux/netradiant-custom/releases) and [Custom Q3Map2](https://github.com/isRyven/map-compiler) support.  
However most of the switches should also work with vanilla [2.5.17 Q3map2](http://icculus.org/gtkradiant/).

## License
MIT
