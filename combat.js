function combatBeginEncounter(game, monster) {
	game.encounter = {monster};
}

function combatEndEncounter(game) { game.encounter = null; }

function combatGetBattleMessage(game, id) { return gameGetMessage(game, game.map.combatStrings[id]); }

function combatAttack(game, attacker, opponent) {
	uiEncounterLog(attacker.name + " " + combatGetBattleMessage(game, 0) + " " + opponent.name + "\\r");

	// TODO: roll/apply damage
}

function combatMonsterAttack(game, monster, opponent) {
	// Monster attacks differ from party attacks in that they have very limited moves.
	// For example, they're just given a weapon type (not a specific weapon), don't have to worry about
	// reloading their weapons, and just have fixed damage amounts + random damage rolls.
	// As such, we can run simplified logic here, for monsters.

	uiEncounterLog(monster.name + " " + combatGetBattleMessage(game, 0) + " " + opponent.name + "\\r");
}

function combatExecuteTurn(game) {
	assert(game.encounter);
	console.log("TODO: execute combat turn");

	// TODO: combat intiative/speed, for turn order
	// for now we just assume the party goes first, in order, and then the monster gets a turn

	// Party attacks monster
	for(const char of game.party) {
		combatAttack(game, char, game.encounter.monster);
	}

	// Monster attacks party
	for(const char of game.party) {
		combatMonsterAttack(game, game.encounter.monster, char);
	}
}