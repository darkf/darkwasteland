"use strict";

function requestShopItemList(game, itemListId, callback) {
	console.log("loading shop items for game", game.map.gameId);
	requestXML("data/gamedata" + game.map.gameId + "/shopitems" + itemListId + ".xml", function(xml) {
		const items = Array.from(xml.getElementsByTagName("shopItem"))
		                   .map(item => {
		                       return { price: item.getAttribute("price")|0
		                              , stock: item.getAttribute("stock")|0
		                              , type: item.getAttribute("type")|0
		                              , capacity: item.getAttribute("capacity")|0
		                              , skill: item.getAttribute("skill")|0
		                              , damage: item.getAttribute("damage")|0
		                              , ammo: item.getAttribute("ammo")|0
		                              , demolition: item.getAttribute("demolition")|0
		                              , id: item.getAttribute("id")|0
		                       };
		                   });
		callback(items);
	});
}
