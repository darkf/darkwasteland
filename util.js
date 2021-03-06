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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function zeropad(n, length) {
	return (new Array(length).fill("0").join("") + n).slice(-length)
}

function assert(cond) {
	if(!cond) {
		debugger;
		throw new Error("Assertion failed");
	}
}

function vecAdd(a, b) { return {x: a.x + b.x, y: a.y + b.y}; }
function vecCopy(v) { return {x: v.x, y: v.y}; }

function isTextNode(xml) { return xml.nodeType === 3; }
function isntTextNode(xml) { return !isTextNode(xml); }

function xmlNodeToObject(xml) {
	const obj = {};
	obj.tag = xml.tagName;
	obj.text = xml.textContent;

	for(const attrId in xml.attributes) {
		const attr = xml.attributes[attrId];
		let value = attr.nodeValue;
		if(value === undefined) continue;

		// convert the value from integers or booleans
		if(value.startsWith("0x")) // hex literal
			value = parseInt(value, 16);
		else if(value === "true")
			value = true;
		else if(value === "false")
			value = false;
		else { // attempt to convert as an integer
			const asInt = parseInt(value, 10);
			if(!isNaN(asInt))
				value = asInt;
		}

		obj[attr.nodeName] = value;
	}

	obj.children = Array.from(xml.childNodes).filter(isntTextNode).map(xmlNodeToObject);

	return obj;
}
