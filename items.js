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

function getItemById(itemId) {
    return _itemTable[itemId] || null;
}

function getMonsterWeapon(monster) {
    const weapon = {randomDamage: monster.randomDamage,
                    fixedDamage: monster.fixedDamage || 0};

    switch(monster.weaponType) {
        case 1:
            weapon.type = "melee";
            break;

        case 2: case 3: case 4:
            weapon.type = "gun";
            weapon.range = {2: "short", 3: "medium", 4: "long"}[monster.weaponType];
            weapon.burst = false;
            break;

        case 5: case 6: case 7:
            weapon.type = "gun";
            weapon.range = {5: "short", 6: "medium", 7: "long"}[monster.weaponType];
            weapon.burst = true;
            break;

        case 8: case 9:
            weapon.type = "rocket";
            weapon.range = {8: "medium", 9: "long"}[monster.weaponType];
            break;

        case 10: case 11: case 12:
            weapon.type = "energy";
            weapon.range = {10: "short", 11: "medium", 12: "long"}[monster.weaponType];
            break;

        case 13:
            weapon.type = "explosive";
            break;

        default:
            throw new Error("Unknown monster weapon type " + monster.weaponType);
    }

    return weapon;
}
