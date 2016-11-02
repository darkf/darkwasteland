DarkWasteland is a reimplementation of the original Wasteland 1 (1988; DOS) game engine, allowing one to play Wasteland from the comfort of their browser.

It is currently feature-incomplete, so don't expect a fully playable game. A few basic things work, and contributions are welcome.

It is licensed under the terms of the MIT license. See LICENSE.txt for more details.

Usage
=====

You'll need the [Wasteland Suite](http://kayahr.github.io/wlandsuite/), and Python 3.

Extract the game files from a copy of the original DOS game (the GOG version might work as well).

Move the tilesets to `data/tilesets/`, with the tiles in the second tileset starting numerically after the first (so it ends with `data/tilesets/008`). (TODO: make the setup process nicer, and use [wastelib](https://github.com/kayahr/wastelib).)

Run `build_tileset.py`.

Move the sprites to `data/sprites/`.

Move `GAME01` and `GAME02` to `data/gamedata1` and `data/gamedata2`, respectively.

Run `play.html`.

If you encounter any issues, feel free to file an issue on the issue tracker.