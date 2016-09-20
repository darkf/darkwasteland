"use strict";

function requestXML(path, callback) {
	const xhr = new XMLHttpRequest();
	xhr.onload = function() { callback(xhr.responseXML); }
	xhr.open("GET", path, true);
	xhr.send();
}

function requestJSON(path, callback) {
	const xhr = new XMLHttpRequest();
	xhr.onload = function() { callback(JSON.parse(xhr.responseText)); }
	xhr.open("GET", path, true);
	xhr.send();
}
