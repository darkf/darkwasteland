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


	const actionClassMap = mapNode.getElementsByTagName("actionClassMap")[0].textContent.trim()
	                       .split("\n")
	                       .map(s => s.trim().split("")
	                       	          .map(t => parseInt(t.replace(".", "0"), 16)));
	map.actionClassMap = actionClassMap;


	const actionMap = mapNode.getElementsByTagName("actionMap")[0].textContent.trim()
	                       .split("\n")
	                       .map(s => s.trim()
	                       	          .split(" ")
	                       	          .map(t => parseInt(t.replace("..", "00"), 16)));
	map.actionMap = actionMap;

	const actionsNodes = mapNode.getElementsByTagName("actions");
	map.actions = {};

	for(const actionsNode of actionsNodes) {
		const actionClass = parseInt(actionsNode.getAttribute("actionClass"), 16);
		const actions = Array.from(actionsNode.childNodes).filter(isntTextNode).map(xmlNodeToObject);
		map.actions[actionClass] = {};

		for(const action of actions) {
			map.actions[actionClass][action.id] = action;
		}
	}

	map.strings = Array.from(mapNode.getElementsByTagName("string")).map(node => node.textContent);

	return map;
}

function loadMapData(map, callback) {
	preloadTileset(map.tilesetNum, callback);
}

function lookupLocation(locationId) {
	return locationMap[locationId];
}
