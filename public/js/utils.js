import {Settings} from "./settings.js";

/**
 * This function generates a random integer in the given range, inclusive.
 *
 * @generator
 * @function getRndInteger
 * @param {number} min - The beginning of the range
 * @param {number} max - The end of the range
 * @return {number} The number generated
 */
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (++max-min) ) + min; // + 1 for max to be included
}

/**
 * This function returns a random item of the two given
 *
 * @function randomOfTwo
 * @param {any} first - The beginning of the range
 * @param {any} second - The end of the range
 * @return {any} The item generated
 */
function randomOfTwo(first, second) {
    return Math.random() < 0.5 ? first : second;
}

/**
 * This function generates a list of items the participant will have in battle
 *
 * @generator
 * @function generateRandomItems
 * @yields {Object} An object of {@link Item}s generated
 */
function generateRandomItems()
{
    let items = {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0
    };

    //choose two healing items and one reviving item
    let first_healing = randomOfTwo('1', '2');
    let second_healing = randomOfTwo('3', '4');
    let first_reviving = '5';

    //increase the item count in the items array
    items[first_healing]++;
    items[second_healing]++;
    items[first_reviving]++;

    return items;
}

/**
 * This function generates an enemy to be inserted into the list
 *
 * @generator
 * @function generateNewEnemy
 * @yields {Participant} The {@link Participant} generated
 */
function generateNewEnemy()
{
    let enemy = {
        name: "Przeciwnik",
        isDodging: 0,
        type: "enemy",
        statusesApplied: [],
        subtype: Math.random() < 0.5 ? "human" : "monster"
    };

    for (let enemyStat of Object.keys(Settings.enemyStatLimits)) {
        enemy[enemyStat] = getRndInteger(Settings.enemyStatLimits[enemyStat].min, Settings.enemyStatLimits[enemyStat].max);
    }
    enemy.maxHealth = enemy.health;

    if(enemy.subtype === "human") enemy.itemsOwned = generateRandomItems();

    return enemy;
}

/**
 * This function generates a player to be inserted into the list
 * for now using a template, to be expanded in later phases
 *
 * @generator
 * @function generateNewPlayer
 * @yields {Participant} The {@link Participant} generated
 */
function generateNewPlayer()
{
    let player = {
        name: "Gracz",
        maxHealth: 100,
        isDodging: 0,
        type: "player",
        health: 100,
        speed: 70,
        attack: 32,
        dodge: 45,
        experience: 0,
        itemsOwned: generateRandomItems(),
        skillsOwned: {"3": 0},
        level: 1,
        armor: 2,
        inUse: false,
        statusesApplied: []
    };

    return player;
}

/**
 * This function handles a d100 or d20 roll and overwrites it if the appropriate debug option is enabled
 *
 * @generator
 * @function handleSystemRoll
 * @param {string} diceType d100 for 1-100 rolls, anything else for 1-20 rolls
 * @returns {number} a roll in range 1-20 or 1-100
 */
function handleSystemRoll(diceType)
{
    let hitCheck;
    let maxRoll = diceType === "d100" ? 100 : 20;
    let definedDebugRoll = Settings.getNextRollValue;
    let overwriteRoll = definedDebugRoll > 0;
    if (overwriteRoll && maxRoll === 100) {
        hitCheck = definedDebugRoll;
        Settings.setNextRollValue = 0;
    }
    else if (overwriteRoll && definedDebugRoll < 21) {
        hitCheck = definedDebugRoll;
        Settings.setNextRollValue = 0;
    }
    else {
        hitCheck = Math.floor(Math.random() * maxRoll) + 1;
    }

    return hitCheck;
}

/**
 * This function handles a d100 or d20 roll and overwrites it if the appropriate debug option is enabled
 *
 * @generator
 * @function randomSystemRoll
 * @param {number} maxRoll the max value of the roll
 * @returns {number} a roll in range 1-maxRoll
 */
function randomSystemRoll(maxRoll)
{
    return Math.floor(Math.random() * maxRoll) + 1;
}

/**
 * This function creates a battle history item with the message sent to the user after a system call
 *
 * @function newSystemCall
 * @param {string} call - The new message to show to the user
 * @return {void}
 */
function newSystemCall(call)
{
    let historyItem = document.createElement("li");
    historyItem.innerText = call;

    document.getElementById("systemCall").appendChild(historyItem);
}

export { generateNewEnemy, generateNewPlayer, handleSystemRoll, newSystemCall, getRndInteger, randomSystemRoll };