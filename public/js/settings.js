import {getAvailableEnemies, getAvailablePlayers, getItems, getSkills} from "./db.js";

/**
 * A special class that stores most parameters of the system
 */
class Settings {
    constructor() {
    }
    /**
     * Whether debugging is enabled or not
     * @type {boolean}
     */
    static debugging = true;
    /**
     * Pre-defined priority 2 flag
     * @type {boolean}
     */
    static priorityTwo = true;
    /**
     * Pre-defined priority 3 flag
     * @type {boolean}
     */
    static priorityThree = true;
    /**
     * Pre-defined global turn counter
     * @type {number}
     */
    static globalTurn = 1;
    /**
     * Pre-defined local turn counter
     * @type {number}
     */
    static localTurn = 0;
    /**
     * Pre-defined player counter
     * @type {number}
     */
    static playerCount = 0;
    /**
     * Pre-defined enemy counter
     * @type {number}
     */
    static enemyCount = 0;
    /**
     * Second counter that only tracks added enemies for number assignment
     * @type {number}
     */
    static addedEnemiesCount = 0;
    /**
     * pre-defined item definition array
     * @type {[{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number},{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number},{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number},{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number},{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number}]}
     */
     static items;
    /**
     *
     * @type {[{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},null,null]}
     */
    static skills;
    /**
     * Pre-defined, empty participants array used outside the battle
     * @type {*[]}
     */
    static participantsDefinition = [];
    /**
     * Pre-defined, empty participants array used during the battle
     * @type {*[]}
     */
    static participants = [];
    /**
     * Fetch available players from the database
     * @type {[{dodge: number, level: number, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, experience: number, type: string, skillsOwned: {Próżnia: number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number},{dodge: number, level: number, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, experience: number, type: string, skillsOwned: {"Energy Ball": number, Kumulacja: number, Hellfire: number, "Wielki Wybuch": number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number},{dodge: number, level: number, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, experience: number, type: string, skillsOwned: {Przygrywka: number, Wskrzeszenie: number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number},{dodge: number, level: number, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, experience: number, type: string, skillsOwned: {"Energy Ball": number, Kumulacja: number, Hellfire: number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number}]}
     */
    static availablePlayers;
    /**
     * Fetch available enemies from the database
     * @type {[{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number}]}
     */
    static availableEnemies;
    /**
     * An object of objects with min and max values for participant generation
     * @type {{dodge: {min: number, max: number}, armor: {min: number, max: number}, zone: {min: number, max: number}, health: {min: number, max: number}, atk: {min: number, max: number}, speed: {min: number, max: number}}}
     */
    static enemyStatLimits = {
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
     * This function generates a random integer in the given range, inclusive.
     *
     * @generator
     * @function getRndInteger
     * @param {number} min - The beginning of the range
     * @param {number} max - The end of the range
     * @return {number} The number generated
     */
    static getRndInteger = function(min, max) {
        return Math.floor(Math.random() * (++max-min) ) + min; // + 1 for max to be included
    };

    static debuggingEnabled() {
        return this.debugging;
    }
    static createAnonymous() {
        //let name = gender == "male" ? "John Doe" : "Jane Doe";
        //return new Person(name);
    }

    static async fetchItems() {
      this.items = await getItems();
    }

    static async fetchSkills() {
        this.skills = await getSkills();
    }

    static async fetchPlayers() {
        this.availablePlayers = await getAvailablePlayers();
    }

    static async fetchEnemies() {
        this.availableEnemies = await getAvailableEnemies();
    }
}

export {Settings};
