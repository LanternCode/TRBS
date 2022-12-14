import {nextTurn, act} from "./action.js";
import {startBattle, continueToBattle} from "./battle.js";
import {addCard} from "./card.js";
import {adjustOptions} from "./list.js";
import {getAvailablePlayers, getAvailableEnemies} from "./db.js";

window.addCard = addCard;
window.act = act;
window.startBattle = startBattle;
window.continueToBattle = continueToBattle;
window.nextTurn = nextTurn;

const actionsList = document.getElementById("actionList");
actionsList.addEventListener("change", () =>  { adjustOptions("actionElements") }, false);

const actionElementsList = document.getElementById("actionElementsList");
actionElementsList.addEventListener("change", () => { adjustOptions("targets") }, false);

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
 * @property {string} [subtype] - Enemy type (human/monster)
 * @property {number} [experience] - Participant's xp count, only for players
 * @property {Object} [itemsOwned] - Participant's items, only for players and human enemies
 * @property {Object} skillsOwned - Participant's skills/spells
 * @property {number} [level] - Participant's level, only for players
 * @property {number} armor - Participant's armor rating
 * @property {number} [zone] - Participant's zone, only for enemies
 */

/**
 * An Item
 * @typedef {Object} Item
 * @property {string} uiid - Unique item id
 * @property {string} displayName - Item display name
 * @property {string} type - Item type (for now only healing)
 * @property {string} subtype - item subtype (for healing items - restore/revive)
 * @property {string} valueType - Item value type (flat or percentage)
 * @property {number} value - Item value (flat number or decimal percentage)
 */

/**
 * A Skill/Spell (for now they're the same thing)
 * @typedef {Object} SkillSpell
 * @property {string} usid - Unique skill id
 * @property {string} name - Skill/spell name
 * @property {string} range - how many participants are targets of the skill/spell (individual, all, everyone - all of the same side or literally everyone)
 * @property {string} target_group - Skill/spell target group (player, enemy, reversed - reversed means the opposite of the user)
 * @property {string} type - Skill/spell type (healing/offensive/supporting/?)
 * @property {string} subtype - Skill/spell subtype (ex. healing can be used as restoring/reviving)
 * @property {string} value - Skill/spell numerical value (ex. 50 - restores 50 hp)
 * @property {string} value_type - Skill/spell value type (flat or percentage)
 * @property {string} value_dep - Skill/spell dependancy (talent/level/special)
 * @property {string} dep - Skill/spell name of the dependancy (ex. sorcery)
 * @property {string} [dep_pattern] - Skill/spell value-dependancy pattern (irregular patterns only)
 * @property {string} cooldown - Skill/spell cooldown in global turns (1 means it's available next turn)
 * @property {string} [cost] - Skill/spell cost (not yet used anywhere)
 * @property {string} priority - Skill/spell priority required
 */

/**
 * An object of objects with min and max values for participant generation
 * @type {{dodge: {min: number, max: number}, armor: {min: number, max: number}, zone: {min: number, max: number}, health: {min: number, max: number}, atk: {min: number, max: number}, speed: {min: number, max: number}}}
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
 * @type {[{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number},{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number},{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number},{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number},{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number}]}
 */
window.items = [
    {
        uiid: 1,
        displayName: "Flakon ??ycia",
        type: "healing",
        subtype: "restore",
        valueType: "flat",
        value: 10
    },
    {
        uiid: 2,
        displayName: "Ma??a Mikstura ??ycia",
        type: "healing",
        subtype: "restore",
        valueType: "flat",
        value: 15
    },
    {
        uiid: 3,
        displayName: "Mikstura ??ycia",
        type: "healing",
        subtype: "restore",
        valueType: "flat",
        value: 22
    },
    {
        uiid: 4,
        displayName: "Wi??ksza Mikstura ??ycia",
        type: "healing",
        subtype: "restore",
        valueType: "flat",
        value: 30
    },
    {
        uiid: 5,
        displayName: "Flakon Regeneracji",
        type: "healing",
        subtype: "revive",
        valueType: "parcentage",
        value: 0.50
    }
];

/**
 *
 * @type {[{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},null,null]}
 */
window.skills = [
    {
        usid: 0,
        name: "Kumulacja",
        range: "individual",
        targetGroup: "player",
        type: "healing",
        subtype: "restore",
        value: 50,
        valueType: "flat",
        cooldown: 3,
        priority: 2
    },
    {
        usid: 1,
        name: "Hellfire",
        range: "everyone",
        targetGroup: "",
        type: "offensive",
        subtype: "damaging",
        value: 30,
        valueType: "flat",
        cooldown: 1,
        priority: 2
    },
    {
        usid: 2,
        name: "Przygrywka",
        range: "all",
        targetGroup: "player",
        type: "healing",
        subtype: "restore",
        value: 20,
        valueType: "flat",
        cooldown: 4,
        priority: 2
    },
    {
        usid: 3,
        name: "Pr????nia",
        range: "all",
        targetGroup: "enemy",
        type: "offensive",
        subtype: "damaging",
        value: 80,
        valueType: "flat",
        cooldown: 2,
        priority: 3
    },
    {
        usid: 4,
        name: "Energy Ball",
        range: "individual",
        targetGroup: "reversed",
        type: "offensive",
        subtype: "damaging",
        value: 70,
        valueType: "flat",
        cooldown: 3,
        priority: 2
    },
    {
        usid: 5,
        name: "Wskrzeszenie",
        range: "individual",
        targetGroup: "player",
        type: "healing",
        subtype: "revive",
        value: 0.5,
        valueType: "percentage",
        cooldown: 4,
        priority: 3
    },
    {
        usid: 6,
        name: "Wielki Wybuch",
        range: "all",
        targetGroup: "reversed",
        type: "offensive",
        subtype: "damaging",
        value: 300,
        valueType: "flat",
        cooldown: 1,
        priority: 2
    }
];

/**
 * Pre-defined, empty participants array used outside the battle
 * @type {*[]}
 */
window.participantsDefinition = [];
/**
 * Pre-defined, empty participants array used during the battle
 * @type {*[]}
 */
window.participants = [];

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

/**
 * Fetch available players from the database
 * @type {[{dodge: number, level: number, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, experience: number, type: string, skillsOwned: {Pr????nia: number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number},{dodge: number, level: number, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, experience: number, type: string, skillsOwned: {"Energy Ball": number, Kumulacja: number, Hellfire: number, "Wielki Wybuch": number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number},{dodge: number, level: number, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, experience: number, type: string, skillsOwned: {Przygrywka: number, Wskrzeszenie: number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number},{dodge: number, level: number, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, experience: number, type: string, skillsOwned: {"Energy Ball": number, Kumulacja: number, Hellfire: number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number}]}
 */
window.availablePlayers = getAvailablePlayers();

/**
 * Fetch available enemies from the database
 * @type {[{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number}]}
 */
window.availableEnemies = getAvailableEnemies();
