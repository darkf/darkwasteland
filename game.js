"use strict";

function gameFromXML(xml, callback) { // Parse savegame.xml
	const saveNode = xml.documentElement;
	const partyNode = saveNode.getElementsByTagName("party")[0];
	const mapId = partyNode.getAttribute("map")|0;
	const npcs = saveNode.getElementsByTagName("character");

	// load map
	requestXML("data/gamedata1/map" + zeropad(mapId, 2) + ".xml", function(xml) {
		const map = mapFromXML(xml);
		map.id = mapId;
		map.gameId = 1;

		callback({ partyPos: {x: partyNode.getAttribute("x")|0,
		                      y: partyNode.getAttribute("y")|0}
		         , map: map
		         , npcs: Array.from(npcs).map(npc => {
			         	return { id: npc.getAttribute("id")|0
		         		       , name: npc.getAttribute("name")
		         		       }
         		        })
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

function gamePrintMessage(game, messageId) {
	const message = game.map.strings[messageId];
	console.log("> " + message);
	uiGameLog(message);
}

function gameApplyAction(game, action) {
	console.log("action:", action)

	switch(action.tag) {
		case "alteration": { // alter tile(s)
			for(const child of action.children) {
				assert(child.tag === "alter");

				game.map.actionClassMap[child.y][child.x] = child.newActionClass;
				game.map.actionMap[child.y][child.x] = child.newAction;
			}

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
			if(action.newActionClass !== undefined)
				game.map.actionClassMap[game.partyPos.y][game.partyPos.x] = action.newActionClass;
			if(action.newAction !== undefined)
				game.map.actionMap[game.partyPos.y][game.partyPos.x] = action.newAction;

			break;
		}

		case "store": { // shop UI
			//game.paused = true;
			uiStore(game);

			if(action.message)
				uiEncounterLog(game.map.strings[action.message]);
			break;
		}

		case "transition": { // transition to another map/location
			if(!action.confirm || confirm("Enter new location?")) { // perform transition
				gamePrintMessage(game, action.message);

				console.log("TODO: transition to map", action.targetMap, "@", action.targetX, ",", action.targetY);

				// save our current (old) map position
				game.map.oldPartyPos = vecCopy(game.partyPos);

				// possibly update the action on the tile
				if(action.newActionClass !== undefined)
					game.map.actionClassMap[game.map.oldPartyPos.y][game.map.oldPartyPos.x] = action.newActionClass;
				if(action.newAction !== undefined)
					game.map.actionMap[game.map.oldPartyPos.y][game.map.oldPartyPos.x] = action.newAction;

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

				if(mapInfo.gameId !== game.map.gameId || mapInfo.gameMapId !== game.map.id) // load another map, not the current one
					gameLoadMap(game, mapInfo.gameId, mapInfo.gameMapId, postLoad);
				else postLoad();
			}

			return true; // we set position manually, don't let it force us back
		}
	}

	return true;
}
