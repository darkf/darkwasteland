"use strict";

function gameFromXML(xml, callback) { // Parse savegame.xml
	const saveNode = xml.documentElement;
	const partyNode = saveNode.getElementsByTagName("party")[0];
	const mapId = partyNode.getAttribute("map")|0;
	const npcs = saveNode.getElementsByTagName("character");

	// load map
	requestXML("data/gamedata1/map" + zeropad(mapId, 2) + ".xml", function(xml) {
		callback({ partyPos: {x: partyNode.getAttribute("x")|0,
		                      y: partyNode.getAttribute("y")|0}
		         , map: mapFromXML(xml)
		         , npcs: Array.from(npcs).map(npc => {
			         	return { id: npc.getAttribute("id")|0
		         		       , name: npc.getAttribute("name")
		         		       }
         		        })
		         });
	});
}

function gameMoveParty(game, dir) {
	const oldPos = vecCopy(game.partyPos);
	game.partyPos = vecAdd(game.partyPos, dirToVec(dir));

	const actionClass = game.map.actionClassMap[game.partyPos.y][game.partyPos.x];
	if(actionClass === 0) return; // no action
	const actionId = game.map.actionMap[game.partyPos.y][game.partyPos.x];
	const action = game.map.actions[actionClass][actionId];


	if(!gameApplyAction(game, action)) // impassable, reset us
		game.partyPos = oldPos;
}

function gamePrintMessage(game, messageId) {
	console.log("> " + game.map.strings[messageId]);
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
	}

	return true;
}
