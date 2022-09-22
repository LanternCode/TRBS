/**
 * The JSON object with xp required to level up
 * @type {string}
 */
const expTable = '{"1":"0", "2":"2", "3":"5", "4":"10","5":"20","6":"50"}';
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
    return xpRequired[lvl+1];
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
    player.atk += 2;
    player.speed += 5;
    player.maxHealth += 10;
    player.dodge += 1;
    player.armor += 1;
    player.experience = 0;
    player.level += 1;
}

export {expRequired, levelUp};