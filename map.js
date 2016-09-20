"use strict";

function mapFromXML(xml) {
	const map = {};
	const mapNode = xml.documentElement;

	map.size = mapNode.getAttribute("mapSize")|0;

	const info = mapNode.getElementsByTagName("info")[0];
	map.tilesetNum = info.getAttribute("tileset")|0;
	map.backgroundTile = info.getAttribute("backgroundTile")|0;

	const tilemap = mapNode.getElementsByTagName("tileMap")[0].textContent.trim()
	                       .split("\n")
	                       .map(s => s.trim()
	                       	          .split(" ")
	                       	          .map(t => parseInt(t.replace("..", map.backgroundTile.toString(16)), 16)));
	map.tilemap = tilemap;

	return map;
}

function loadMapData(map, callback) {
	preloadTileset(map.tilesetNum, callback);
}
