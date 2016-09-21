"use strict";

let $modalUI = document.getElementById("modal-ui");
let $portrait = document.getElementById("portrait");
let $portraitImage = document.getElementById("portrait-image");
let $enctext = document.getElementById("enctext");
let $gametext = document.getElementById("game-text");
let $party = document.getElementById("party");

let _shopItems;

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

function uiUpdateParty(game, callback) {
	$party.innerHTML = "";

	for(const char of game.party) {
		const $el = document.createElement("DIV");
		$el.innerText = char.id + ") " + char.name;
		$el.onclick = function() { if(callback) callback(char); }
		$party.appendChild($el);
	}
}

function uiBuy(game, char) {
	$enctext.innerHTML = "";
	uiEncounterLog("You have $" + char.money + "\n\n");
	
	let id = 0;
	for(const item of _shopItems) {
		if(item.stock === 0) continue;
		id++;

		const $el = document.createElement("DIV");
		$el.innerText = id + ") " + item.id + " (type " + item.type + ")";
		$el.onclick = function() {
			// buy item
		}
		$enctext.appendChild($el);
	}
}

function uiSell(game, char) {
}

function uiStoreSetPartyMember(game, char) { // char wants to enter the shop
	uiEncounterLog("You have $" + char.money + "\n\n");
	uiEncounterLog("Do you want to:\n");

	// buy/sell buttons
	const $buy = document.createElement("DIV");
	const $sell = document.createElement("DIV");

	$buy.innerText = "Buy"; $sell.innerText = "Sell";

	$buy.onclick = function() {
		$buy.onclick = null;
		$sell.onclick = null;
		console.log("buy mode");
		uiBuy(game, char);
	};

	$sell.onclick = function() {
		$buy.onclick = null;
		$sell.onclick = null;
		console.log("sell mode");
		uiSell(game, char);
	};

	$enctext.appendChild($buy);
	$enctext.appendChild($sell);
	$enctext.scrollTop += 999;
}

function uiStore(game, action) {
	const itemTypes = action.children.map(itemType => itemType.text|0);
	requestShopItemList(game, action.itemList, function(items) {
		_shopItems = items.filter(item => itemTypes.indexOf(item.type) !== -1);

		uiEncounterLog("\nWho wants to enter?\n");
		uiUpdateParty(game, char => uiStoreSetPartyMember(game, char));
		uiShow();
	});
}

function uiDialogue(game, action) {
	$enctext.innerHTML = "";
	uiEncounterLog(gameGetMessage(game, action.message));

	for(const answer of action.children) {
		assert(answer.tag === "answer");
		const message = gameGetMessage(game, answer.message);
		console.log("-", message);

		const $el = document.createElement("DIV");
		$el.innerText = message;
		$el.onclick = function() {
			// update to the new action class
			if(answer.newActionClass !== undefined)
				game.map.actionClassMap[game.partyPos.y][game.partyPos.x] = answer.newActionClass;
			if(answer.newAction !== undefined)
				game.map.actionMap[game.partyPos.y][game.partyPos.x] = answer.newAction;

			// walk in-place to trigger the new action
			gameMoveParty(game, game.partyPos);
		}

		$enctext.appendChild($el);
	}

	uiShow();
}