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
