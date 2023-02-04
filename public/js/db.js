import {generateRandomItems, generateNewEnemy} from "./card.js"; // temp

/**
 * This function obtains the players list
 *
 * @function getAvailablePlayers
 * @returns {[{dodge: number, level: number, itemsOwned: {"1": number, "2": number, "3": number, "4": number, "5": number}, health: number, experience: number, type: string, skillsOwned: {Próżnia: number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number},{dodge: number, level: number, itemsOwned: {"1": number, "2": number, "3": number, "4": number, "5": number}, health: number, experience: number, type: string, skillsOwned: {"Energy Ball": number, Kumulacja: number, Hellfire: number, "Wielki Wybuch": number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number},{dodge: number, level: number, itemsOwned: {"1": number, "2": number, "3": number, "4": number, "5": number}, health: number, experience: number, type: string, skillsOwned: {Przygrywka: number, Wskrzeszenie: number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number},{dodge: number, level: number, itemsOwned: {"1": number, "2": number, "3": number, "4": number, "5": number}, health: number, experience: number, type: string, skillsOwned: {"Energy Ball": number, Kumulacja: number, Hellfire: number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number}]}
 */
 function getAvailablePlayers()
{
    return [
        {
            UID:  0,
            name: 'Karim',
            maxHealth: 100,
            health: 100,
            speed: 81,
            atk: 200,
            dodge: 11,
            experience: 0,
            isDodging: 0,
            type: "player",
            itemsOwned: generateRandomItems(),
            skillsOwned: {"3": 0},
            level: 1,
            armor: 0,
            inUse: false
        },
        {
            UID:  1,
            name: 'Antonio',
            maxHealth: 80,
            health: 80,
            speed: 82,
            atk: 15,
            dodge: 9,
            experience: 0,
            isDodging: 0,
            type: "player",
            itemsOwned: generateRandomItems(),
            skillsOwned: {"4": 0, "0": 0, "1": 0, "6": 0},
            level: 1,
            armor: 0,
            inUse: false
        },
        {
            UID:  2,
            name: 'Dion',
            maxHealth: 90,
            health: 90,
            speed: 17,
            atk: 10,
            dodge: 6,
            experience: 0,
            isDodging: 0,
            type: "player",
            itemsOwned: generateRandomItems(),
            skillsOwned: {"5": 0, "2": 0},
            level: 1,
            armor: 0,
            inUse: false
        },
        {
            UID:  3,
            name: 'Astrid',
            maxHealth: 80,
            health: 80,
            speed: 17,
            atk: 10,
            dodge: 6,
            experience: 0,
            isDodging: 0,
            type: "player",
            itemsOwned: generateRandomItems(),
            skillsOwned: {"4": 0, "0": 0, "1": 0},
            level: 1,
            armor: 0,
            inUse: false
        }
    ]; // temp
}

/**
 * This function obtains the enemies list
 *
 * @function getAvailableEnemies
 * @return {[{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number}]}
 */
function getAvailableEnemies()
{
    let enemies = [];
    for (let i = 0; i < 5; i++)
        enemies[i] = generateNewEnemy(); // temp
    return enemies;
}

export {getAvailablePlayers, getAvailableEnemies};
