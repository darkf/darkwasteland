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

function uiClearEncounterLog() { $enctext.innerHTML = ""; }

function uiUpdateParty(game, callback) {
    $party.innerHTML = "";

    $party.innerHTML = "Name AC CON<br>";
    for(const char of game.party) {
        const $el = document.createElement("DIV");
        $el.innerText = char.id + ") " + char.name + " " + char.stats.ac + " " + char.stats.con;
        $el.onclick = function() { if(callback) callback(char); }
        $party.appendChild($el);
    }
}

function uiBuy(game, char) {
    $enctext.innerHTML = "";
    uiEncounterLog("You have $" + char.money + "\n\n");
    
    let id = 0;
    uiBeginOptions();
    for(const shopItem of _shopItems) {
        if(shopItem.stock === 0) continue;
        id++;

        // actual item, from the item table
        // TODO/XXX: do the stats in the shop tables differ from the originals?
        const item = _itemTable[shopItem.id];
        const name = item ? item.name : shopItem.id;

        uiOption(id + ") " + name + " (id " + shopItem.id + ", type " + shopItem.type + ")", () => {
            // buy item
        });
    }
    uiEndOptions();
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

function uiBeginOptions() { }
function uiEndOptions() { }
function uiOption(optionTitle, callback) {
    // TODO: also set up numbers for using the keyboard
    const $el = document.createElement("DIV");
    $el.innerText = optionTitle.replace("\\r", "");
    $el.onclick = function() { callback(); }
    $enctext.appendChild($el);
}
function uiOptions(options) {
    uiBeginOptions();
    for(const option of options)
        uiOption(option[0], option[1]);
    uiEndOptions();
}

function uiEncounter(game, action, encounterFinishedCallback) {
    uiShow();

    // Start at the encounter's main menu, cycling characters in the party
    // asking for what action they should take.

    // TODO: Actually save the chosen options somewhere (probably in game.encounter).

    const numChars = game.party.length;
    function next(cur) {
        if(cur === numChars) {
            uiEncounterLog("Use these options?");
            uiOptions([ ["Y", () => { combatExecuteTurn(game); uiUpdateParty(game, null); }]
                      , ["N", () => { next(0); }]
                      ]);
        }
        else
            uiEncounterMainMenu(game, game.party[cur], () => { uiClearEncounterLog(); next(cur+1); });
    }
    next(0);
}

function uiEncounterMainMenu(game, char, optionChosenCallback) {
    uiUpdateParty(game, null);

    uiEncounterLog(char.name + ", choose:\\r");
    uiEncounterLog("");

    // TODO: Relevant messages, such as reminding the player to reload/unjam their weapon.
    // TODO: Implement remaining options.
    // TODO: Support multiple parties
    // TODO: Support multiple monsters (and selection of them)
    // TODO: Support multiple encounter groups

    uiBeginOptions();
        // uiOption("Run", null);
        // uiOption("Use", null);
        // uiOption("Hire", null);
        // uiOption("Evade", null);
        uiOption("Attack", () => { optionChosenCallback(); }); // TODO: current encounter context
        // uiOption("Weapon", null);
        // uiOption("Load/unjam", null);
    uiEndOptions();
}


function uiDialogue(game, action) {
    $enctext.innerHTML = "";
    const message = gameGetMessage(game, action.message);

    function answerWith(answerStr) {
        // try to find the answer
        let answer = null;
        for(const child of action.children) {
            assert(child.tag === "answer");
            if(gameGetMessage(game, child.message).toLowerCase() === answerStr.toLowerCase()) {
                answer = child;
                break;
            }
        }

        if(!answer)
            return null;

        // possibly update to the new action class
        if(mapSetActionPair(game.map, game.partyPos, answer.newActionClass, answer.newAction)) {
            console.log("set action pair")
            // walk in-place to trigger the new action
            gameMoveParty(game, game.partyPos);
        }

        return answer;
    }

    if(action.menu) {
        // For menu-based dialogue, the question is delimited by \x11, and
        // the options following begin with \x10, followed by a character
        // representing the answer (a letter or digit).
        const [question, all_options] = message.split("\\x11");
        const options = all_options.split("\\x10").slice(1);
        uiEncounterLog(question);

        // display a menu of possible dialogue options
        uiBeginOptions();
        for(const answer of options) {
            // answer with the first character
            uiOption(answer, () => {
                answerWith(answer[0]);

                // close UI
                uiHide();
            });
        }
        uiEndOptions();
    }
    else { // free-form typing dialogue
        uiEncounterLog(message);

        const answerStr = prompt(message);
        if(!answerStr) {
            // TODO: apply cancel dialogue action pairs, if any
            uiHide();
            return;
        }

        if(!answerWith(answerStr)) {
            // unknown answer
            if(mapSetActionPair(game.map, game.partyPos, action.otherNewActionClass, action.otherNewAction)) {
                // walk in-place to trigger the new action
                gameMoveParty(game, game.partyPos);
            }
        }
    }

    uiShow();
}