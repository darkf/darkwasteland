"use strict";

let tilesetCache, spriteCache;
let tilesetLengths;

function preloadTileset(tilesetNum, callback) {
	if(!tilesetLengths) { // if necessary, request tileset metadata
		requestJSON("data/tilesets/tilesets.json", function(data) {
			tilesetLengths = data;
			preloadTileset(tilesetNum, callback);
		});
		return;
	}

	const tilesetBasePath = "data/tilesets/" + ("000" + tilesetNum).slice(-3) + "/";
	const length = tilesetLengths[tilesetNum];
	var loaded = 0;
	tilesetCache = new Array(length);
	for(let i = 0; i < length; i++) {
		const tileImage = new Image();
		tileImage.onload = function() { loaded++; }
		tileImage.onerror = function() { throw new Error("Failed to load tile image"); }
		tileImage.src = tilesetBasePath + ("000" + i).slice(-3) + ".png";
		tilesetCache[i] = tileImage;
	}

	// spin until loading has completed
	function spin() {
		console.log("spin: loaded=%o, length=%o", loaded, length)
		if(loaded < length) // still loading
			return setTimeout(spin, 300 /* ms */);

		// done
		callback();
	}

	spin();
}

function preloadSprites(callback) {
	spriteCache = new Array(10);
	var loaded = 0;

	for(let i = 0; i < 10; i++) {
		const spriteImage = new Image();
		spriteImage.onload = function() { loaded++; }
		spriteImage.onerror = function() { throw new Error("Failed to load sprite image"); }
		spriteImage.src = "data/sprites/" + zeropad(i, 3) + ".png";
		spriteCache[i] = spriteImage;
	}

	// spin until loading has completed
	function spin() {
		console.log("spin: loaded=%o, length=%o", loaded, length)
		if(loaded < length) // still loading
			return setTimeout(spin, 300 /* ms */);

		// done
		callback();
	}

	spin();
}

function getTileImage(tileNum) {
	return tilesetCache[tileNum - 10];
}

function getSpriteImage(spriteNum) {
	return spriteCache[spriteNum];
}
