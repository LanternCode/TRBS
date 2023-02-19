/**
 * This function generates a random integer in the given range, inclusive.
 *
 * @generator
 * @function getRndInteger
 * @param {number} min - The beginning of the range
 * @param {number} max - The end of the range
 * @return {number} The number generated
 */
import {Settings} from "./settings.js";

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
        atk: 32,
        dodge: 45,
        experience: 0,
        itemsOwned: generateRandomItems(),
        skillsOwned: {"3": 0},
        level: 1,
        armor: 2,
        inUse: false
    };

    return player;
}

export { generateNewEnemy, generateNewPlayer };