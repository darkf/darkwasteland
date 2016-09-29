"use strict";

function gameFromXML(xml, callback) { // Parse savegame.xml
	const saveNode = xml.documentElement;
	const partyNode = saveNode.getElementsByTagName("party")[0];
	const mapId = partyNode.getAttribute("map")|0;
	const characters = saveNode.getElementsByTagName("character");

	// load map
	requestXML("data/gamedata1/map" + zeropad(mapId, 2) + ".xml", function(xml) {
		const map = mapFromXML(xml);
		map.id = mapId;
		map.gameId = 1;

		callback({ partyPos: {x: partyNode.getAttribute("x")|0,
		                      y: partyNode.getAttribute("y")|0}
		         , encounter: null
		         , map: map
		         , party: Array.from(characters).map(char => {
			         	return { id: char.getAttribute("id")|0
		         		       , name: char.getAttribute("name")
		         		       , money: char.getAttribute("money")|0
		         		       , inventory: Array.from(char.getElementsByTagName("item")).map(item => getItemById(item.getAttribute("id"))).filter(x => x)
		         		       , weapon: null
		         		       }
         		        }).filter(char => char.name)
		         });
	});
}

function gameLoadMap(game, gameId, mapId, callback) {
	// load map
	console.log("loading map", mapId);
	requestXML("data/gamedata" + gameId + "/map" + zeropad(mapId, 2) + ".xml", function(xml) {
		game.map = mapFromXML(xml);
		game.map.id = mapId;
		game.map.gameId = gameId;

		loadMapData(game.map, callback);
	});	
}

function gameMoveParty(game, pos) {
	const oldPos = vecCopy(game.partyPos);
	game.partyPos = pos;

	const actionClass = game.map.actionClassMap[game.partyPos.y][game.partyPos.x];
	if(actionClass === 0) { // no action
		centerCamera(game.partyPos);
		return;
	}
	const actionId = game.map.actionMap[game.partyPos.y][game.partyPos.x];
	const action = game.map.actions[actionClass][actionId];


	if(!gameApplyAction(game, action)) // impassable, reset us
		game.partyPos = oldPos;

	centerCamera(game.partyPos);
}

function gameMovePartyInDir(game, dir) { return gameMoveParty(game, vecAdd(game.partyPos, dirToVec(dir))) }

function gameGetMessage(game, messageId) {
	return game.map.strings[messageId];
}

function gamePrintMessage(game, messageId) {
	const message = game.map.strings[messageId];
	console.log("> " + message);
	uiGameLog(message);
}

function gameApplyAction(game, action) {
	console.log("action:", action)

	switch(action.tag) {
		case "alteration": { // alter tile(s)
			// emit a message
			if(action.message)
				gamePrintMessage(game, action.message);

			// alter target tiles
			for(const child of action.children) {
				assert(child.tag === "alter");

				// TODO: Does the case when x/y are not specified refer to
				// the *current* (before stepping) tile, or the tile after stepping?

				let pos;
				if(child.x !== undefined && child.y !== undefined)
					pos = {x: child.x, y: child.y};
				else
					pos = vecCopy(game.partyPos);

				mapSetActionPair(game.map, pos, child.newActionClass, child.newAction);

				if(pos.x === game.partyPos.x && pos.y === game.partyPos.y) {
					// was changed; walk in-place to trigger the new action (TODO: is this the correct behavior?)
					gameMoveParty(game, game.partyPos);
				}
			}

			// possibly alter current tile
			if(mapSetActionPair(game.map, game.partyPos, action.newActionClass, action.newAction)) {
				// was changed; walk in-place to trigger the new action (TODO: is this the correct behavior?)
				gameMoveParty(game, game.partyPos);
			}

			// TODO: Does this take effect immediately (i.e. do we need to walk in-place)?
			break;
		}

		case "impassable": { // impassable tile; possibly print
			if(action.message !== undefined)
				gamePrintMessage(game, action.message);

			return false; // impassable
		}

		case "print": { // print a message
			for(const child of action.children) {
				assert(child.tag === "message");
				gamePrintMessage(game, child.text|0);
			}

			// possibly update the action on the tile
			if(mapSetActionPair(game.map, game.partyPos, action.newActionClass, action.newAction)) {
				// was changed; walk in-place to trigger the new action (TODO: is this the correct behavior?)
				gameMoveParty(game, game.partyPos);
			}

			break;
		}

		case "store": { // shop UI
			//game.paused = true;
			uiStore(game, action);

			if(action.message !== undefined)
				uiEncounterLog(game.map.strings[action.message]);
			break;
		}

		case "dialogue": {
			uiDialogue(game, action);
			break;
		}

		case "encounter": {
			if(action.friendly) // friendly NPCs can't be stepped into
				return false;

			// TODO: encounters
			if(action.message !== undefined)
				uiEncounterLog(gameGetMessage(game, action.message));

			// Ensure the party members have weapons equipped, or equip one for them.
			// TODO: This should not be necessary after we use the proper saved equipped weapon.
			for(const char of game.party) {
				if(!char.weapon)
					char.weapon = char.inventory.filter(item => item.type === "weapon")[0] || null;
			}

			// TODO: encounter groups, and separate party groups
			// TODO: separate UI for the box telling the player an encounter is beginning.

			assert(action.monster1 in game.map.monsters);
			const monster = Object.assign({}, game.map.monsters[action.monster1]);
			monster.name = monster.name.split("\\n")[0]; // TODO: regard `action.properName` property
			monster.weapon = getMonsterWeapon(monster);

			console.log("Monster: %o with weapon: %o", monster, monster.weapon);

			uiEncounterLog("1 " + monster.name + " appears at XX feet.\\r");

			uiEncounter(game, action, () => { // encounter is done
				// TODO: set new action pair
			});

			break;
		}

		case "check": {
			if(!action.autoCheck) { // we only perform auto-check checks here
				// for debugging purposes, this is actually useful to allow use checks too
				//break;
			}

			const checks = action.children;

			// TODO: how does modifierTarget work?
			// TODO: how does check "difficulty" / rolling work?

			console.log("check: %o", action);

			if(action.startMessage)
				gamePrintMessage(game, action.startMessage);

			if(true) { // passed check; for now, stubbed to always pass
				if(action.passMessage !== undefined)
					gamePrintMessage(game, action.passMessage);

				// passed, set up new action pairs
				if(mapSetActionPair(game.map, game.partyPos, action.passNewActionClass, action.passNewAction)) {
					// was changed; walk in-place to trigger the new action (TODO: is this the correct behavior?)
					gameMoveParty(game, game.partyPos);
				}

			}

			break;
		}

		case "transition": { // transition to another map/location
			if(action.message !== undefined)
				gamePrintMessage(game, action.message);

			if(!action.confirm || confirm("Enter new location?")) { // perform transition
				console.log("Transitioning to map", action.targetMap, "@", action.targetX, ",", action.targetY);

				// save our current (old) map position
				game.map.oldPartyPos = vecCopy(game.partyPos);

				// possibly update the action on the old tile
				mapSetActionPair(game.map, game.map.oldPartyPos, action.newActionClass, action.newAction);

				// calculate new map position
				let newPos;
				if(action.relative)
					newPos = {x: game.partyPos.x + (action.targetX || 0), y: game.partyPos.y + (action.targetY || 0)};
				else
					newPos = {x: action.targetX, y: action.targetY};

				console.log("newPos: %o", newPos);

				function postLoad() {
					gameMoveParty(game, newPos);
				}

				// targetMap is actually a location ID, which needs to be converted via a lookup table, NOT a map ID.
				// We look it up here, and translate it into the proper game ID and map ID within that game.
				const mapInfo = lookupLocation(action.targetMap);
				assert(mapInfo);

				if(mapInfo.gameId !== game.map.gameId || mapInfo.gameMapId !== game.map.id) // load another map, not the current one
					gameLoadMap(game, mapInfo.gameId, mapInfo.gameMapId, postLoad);
				else postLoad();
			}

			return true; // we set position manually, don't let it force us back
		}
	}

	return true;
}
