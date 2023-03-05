import {newSystemCall} from "./utils.js";
import {updateParticipant} from "./db.js";

/**
 * The JSON object with xp required to level up
 * @type {string}
 */
const expTable = '{"1":"0", "2":"2", "3":"5", "4":"10","5":"20","6":"50","7":"100","8":"250","9":"780","10":"2850"}';
/**
 * A JS object to fetch the value by its key
 * @type {any}
 */
let xpRequired = JSON.parse(expTable);

/**
 * This function returns the xp required to level up
 *
 * @function expRequired
 * @param {string} lvl - The current level
 * @return {number}
 */
function expRequired(lvl)
{
    if(lvl < 10) return xpRequired[lvl+1];
    else return 0;
}

/**
 * This function increases a player's level
 *
 * @function levelUp
 * @param {Participant} player - The player who levels up
 * @return {void}
 */
function levelUp(player)
{
    if(player.level < 10) {
        player.attack += 2;
        player.speed += 5;
        player.maxHealth += 10;
        player.dodge += 1;
        player.armor += 1;
        player.experience = 0;
        player.level += 1;

        updateParticipant(player, "player");
    }
    else {
        newSystemCall("Gracz posiada już maksymalny poziom!");
    }
}

/**
 * This function decreases a player's level
 *
 * @function levelDown
 * @param {Participant} player - The player who levels down
 * @return {void}
 */
function levelDown(player)
{
    if(player.level > 1) {
        if(player.attack > 2)
            player.attack -= 2;
        if(player.speed > 5)
            player.speed -= 5;
        if(player.maxHealth > 10)
            player.maxHealth -= 10;
        if(player.dodge > 1)
            player.dodge -= 1;
        if(player.armor > 1)
            player.armor -= 1;
        player.experience = 0;
        player.level -= 1;

        updateParticipant(player, "player");
    }
    else {
        newSystemCall("Gracz posiada pierwszy poziom!");
    }
}

export {expRequired, levelUp, levelDown};
