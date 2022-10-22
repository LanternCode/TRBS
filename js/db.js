import {generateRandomItems, generateNewEnemy} from "./card.js"; // temp

/**
 * This function obtains the players list
 *
 * @function getAvailablePlayers
 * @return {[{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number}]}
 */
 function getAvailablePlayers()
{
    return [
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
            itemsOwned: generateRandomItems(),
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
            itemsOwned: generateRandomItems(),
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
            itemsOwned: generateRandomItems(),
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
            itemsOwned: generateRandomItems(),
            level: 1,
            armor: 0
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
    var enemies = [];
    for (var i = 0; i < 5; i++)
        enemies[i] = generateNewEnemy(); // temp
    return enemies;
}

export {getAvailablePlayers, getAvailableEnemies};
