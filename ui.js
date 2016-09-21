"use strict";

let $modalUI = document.getElementById("modal-ui");
let $portrait = document.getElementById("portrait");
let $portraitImage = document.getElementById("portrait-image");
let $enctext = document.getElementById("enctext");
let $gametext = document.getElementById("game-text");
let $party = document.getElementById("party");

function uiShow() { $modalUI.style.display = "block"; }
function uiHide() { $modalUI.style.display = "none"; }

function uiExit() { // esc was hit/clicked
	uiHide();
}

function uiGameLog(message) {
	$gametext.innerText += message.replace(/\\r/g, "\n");
	$gametext.scrollTop += 999;
}

function uiEncounterLog(message) {
	$enctext.innerText += message.replace(/\\r/g, "\n");
	$enctext.scrollTop += 999;
}

function uiStore(game) {
	

	uiShow();
}