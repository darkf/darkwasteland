"use strict";

function requestXML(path, callback) {
	const xhr = new XMLHttpRequest();
	xhr.onload = function() { callback(xhr.responseXML); }
	xhr.open("GET", path, true);
	xhr.send();
}
