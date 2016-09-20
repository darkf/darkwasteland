"use strict";

function mapFromXML(xml) {
	const map = {};
	const mapNode = xml.documentElement;

	map.size = mapNode.getAttribute("mapSize")|0;

	const tilemap = mapNode.getElementsByTagName("tileMap")[0].textContent.trim()
	                       .split("\n")
	                       .map(s => s.trim()
	                       	          .split(" ")
	                       	          .map(t => parseInt(t.replace(".", "0"), 16)));
	map.tilemap = tilemap;

	return map;
}
