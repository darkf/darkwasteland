"use strict";

let tilesetImage, spriteCache;
let tilesetLengths;

function preloadTileset(tilesetNum, callback) {
    if(!tilesetLengths) { // if necessary, request tileset metadata
        requestJSON("data/tilesets/tilesets.json", function(data) {
            tilesetLengths = data;
            preloadTileset(tilesetNum, callback);
        });
        return;
    }

    console.log("loading tileset", tilesetNum);

    tilesetImage = new Image();
    tilesetImage.onload = function() {
        console.log("preloadTileset: done loading tileset", tilesetNum);
        callback();
    }
    tilesetImage.onerror = function() { throw new Error("Failed to load tileset " + tilesetNum); }
    tilesetImage.src = "data/tilesets/" + tilesetNum + ".png";
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

function getTilesetOffsetOf(game, tileNum) {    
    const index = tileNum - 10;

    if(index < 0 || index >= getTilesetLength(game.map.tilesetNum))
        return null;

    return {x: index*16, y: 0};
}

function getTilesetLength(tilesetNum) {
    return tilesetLengths[tilesetNum];
}

function getSpriteImage(spriteNum) {
    return spriteCache[spriteNum];
}
