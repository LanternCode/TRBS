import {nextTurn, act} from "./action.js";
import {startBattle} from "./battle.js";
import {addCard, delCard} from "./card.js";

window.addCard = addCard;
window.delCard = delCard;
window.act = act;
window.startBattle = startBattle;
window.nextTurn = nextTurn;

/**
 *
 * @type {[{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number}]}
 */
window.players = [
    {
        name: 'Karim',
        maxHealth: 100,
        health: 100,
        speed: 81,
        atk: 200,
        dodge: 11,
        experience: 0,
        isDodging: 0,
        type: "player",
        itemsOwned: {
            'life_flask': 1,
            'small_life_potion': 0,
            'life_potion': 1,
            'large_life_potion': 0,
            'regeneration_flask': 0
        },
        level: 1,
        armor: 0
    },
    {
        name: 'Antonio',
        maxHealth: 80,
        health: 80,
        speed: 82,
        atk: 15,
        dodge: 9,
        experience: 0,
        isDodging: 0,
        type: "player",
        itemsOwned: {
            'life_flask': 0,
            'small_life_potion': 1,
            'life_potion': 0,
            'large_life_potion': 1,
            'regeneration_flask': 0
        },
        level: 1,
        armor: 0
    },
    {
        name: 'Dion',
        maxHealth: 90,
        health: 90,
        speed: 17,
        atk: 10,
        dodge: 6,
        experience: 0,
        isDodging: 0,
        type: "player",
        itemsOwned: {
            'life_flask': 0,
            'small_life_potion': 0,
            'life_potion': 0,
            'large_life_potion': 0,
            'regeneration_flask': 1
        },
        level: 1,
        armor: 0
    },
    {
        name: 'Astrid',
        maxHealth: 80,
        health: 80,
        speed: 17,
        atk: 10,
        dodge: 6,
        experience: 0,
        isDodging: 0,
        type: "player",
        itemsOwned: {
            'life_flask': 0,
            'small_life_potion': 0,
            'life_potion': 0,
            'large_life_potion': 0,
            'regeneration_flask': 10
        },
        level: 1,
        armor: 0
    }];

/**
 * A Participant
 * @typedef {Object} Participant
 * @property {string} name - Participant's name
 * @property {number} maxHealth - Participant's endurance
 * @property {number} health - Participant's current hp (for use in battles)
 * @property {number} speed - Participant's speed
 * @property {number} atk - Participant's attack
 * @property {number} dodge - Participant's dodge
 * @property {boolean} isDodging - Participant dodge action on or off
 * @property {string} type - Participant type (enemy/player)
 * @property {number} [experience] - Participant's xp count, only for players
 * @property {Object} [itemsOwned] - Participant's items, only for players
 * @property {number} [level] - Participant's level, only for players
 * @property {number} armor - Participant's armor rating
 * @property {number} [zone] - Participant's zone, only for enemies
 */

/**
 * An Item
 * @typedef {Object} Item
 * @property {string} name - Item id
 * @property {string} displayName - Item display name
 * @property {string} type - Item type (for now only healing)
 * @property {string} valueType - Item value type (flat or percentage)
 * @property {number} value - Item value (flat number or decimal percentage)
 */

/**
 * An object of objects with min and max values for participant generation
 *
 * @type {{dodge: {min: number, max: number}, health: {min: number, max: number}, atk: {min: number, max: number}, speed: {min: number, max: number}}}
 */

window.enemyStatLimits = {
    health: {
        min: 50,
        max: 100
    },
    speed: {
        min: 1,
        max: 100
    },
    atk: {
        min: 9,
        max: 22
    },
    dodge: {
        min: 6,
        max: 11
    },
    zone: {
        min: 1,
        max: 10
    },
    armor: {
        min: 0,
        max: 9
    }
};

/**
 * pre-defined item definition array
 * @type {[{subtype: string, displayName: string, valueType: string, name: string, type: string, value: number},{subtype: string, displayName: string, valueType: string, name: string, type: string, value: number},{subtype: string, displayName: string, valueType: string, name: string, type: string, value: number},{subtype: string, displayName: string, valueType: string, name: string, type: string, value: number},{subtype: string, displayName: string, valueType: string, name: string, type: string, value: number}]}
 */
window.items = [
    {
        name: "life_flask",
        displayName: "Flakon Życia",
        type: "healing",
        subtype: "restore",
        valueType: "flat",
        value: 10
    },
    {
        name: "small_life_potion",
        displayName: "Mała Mikstura Życia",
        type: "healing",
        subtype: "restore",
        valueType: "flat",
        value: 15
    },
    {
        name: "life_potion",
        displayName: "Mikstura Życia",
        type: "healing",
        subtype: "restore",
        valueType: "flat",
        value: 22
    },
    {
        name: "large_life_potion",
        displayName: "Większa Mikstura Życia",
        type: "healing",
        subtype: "restore",
        valueType: "flat",
        value: 30
    },
    {
        name: "regeneration_flask",
        displayName: "Flakon Regeneracji",
        type: "healing",
        subtype: "revive",
        valueType: "parcentage",
        value: 0.50
    }
];

/**
 * Pre-defined, empty participants array
 * @type {*[]}
 */
window.participants = [];
/**
 * Pre-defined player counter
 * @type {number}
 */
window.playerCount = 0;
/**
 * Pre-defined enemy counter
 * @type {number}
 */
window.enemyCount = 0;

/**
 * Pre-defined global turn counter
 * @type {number}
 */
window.globalTurn = 1;
/**
 * Pre-defined local turn counter
 * @type {number}
 */
window.localTurn = 0;

/**
 * Pre-defined priority 2 flag
 * @type {boolean}
 */
window.priorityTwo = true;
/**
 * Pre-defined priority 3 flag
 * @type {boolean}
 */
window.priorityThree = true;

/**
 * This function generates a random integer in the given range, inclusive.
 *
 * @generator
 * @function getRndInteger
 * @param {number} min - The beginning of the range
 * @param {number} max - The end of the range
 * @return {number} The number generated
 */
window.getRndInteger = function(min, max) {
    return Math.floor(Math.random() * (++max-min) ) + min; // + 1 for max to be included
};
