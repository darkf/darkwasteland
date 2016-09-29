function combatBeginEncounter(game, monster) {
	game.encounter = {monster};
}

function combatEndEncounter(game) { game.encounter = null; }

function combatGetBattleMessage(game, id) { return gameGetMessage(game, game.map.combatStrings[id]); }

function combatRollDamage(d6) {
	// For combat rolls, we sum rolls of Xd6.

	let sum = 0;
	for(let i = 0; i < d6; i++)
		sum += getRandomInt(1, 6+1); // Roll and sum a random integer in the range [1,6]

	return sum;
}

function combatDamage(opponent, damage) {
	// TODO: take into account AC (armor)
	opponent.stats.con -= damage;
	return opponent.stats.con >= 0;
}

function combatAttack(game, attacker, opponent) {
	// TODO: expend ammo
	// TODO: take into account ammo type for damage

	const damage =  combatRollDamage(attacker.weapon.damage);
	combatDamage(opponent, damage);

	uiEncounterLog(attacker.name + " " + combatGetBattleMessage(game, 0) + " " + opponent.name);
	uiEncounterLog(" for " + damage + " points of damage.\\r");
}

function combatMonsterAttack(game, monster, opponent) {
	// Monster attacks differ from party attacks in that they have very limited moves.
	// For example, they're just given a weapon type (not a specific weapon), don't have to worry about
	// reloading their weapons, and just have fixed damage amounts + random damage rolls.
	// As such, we can run simplified logic here, for monsters.

	const damage = monster.weapon.fixedDamage + combatRollDamage(monster.weapon.randomDamage);
	combatDamage(opponent, damage);

	uiEncounterLog(monster.name + " " + combatGetBattleMessage(game, 0) + " " + opponent.name);
	uiEncounterLog(" for " + damage + " points of damage.\\r");
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