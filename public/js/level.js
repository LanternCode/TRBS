import {newSystemCall} from "./utils.js";
import {updateParticipant} from "./db.js";

/**
 * A table that defines the amount of xp required to move to the next level
 * As well as statistics rewarded for reaching that level (or when a level is lost)
 *
 * @type {{"2": {dexGain: number, hpGain: number, strGain: number, appGain: number, dodgeGain: number, attackGain: number, spdGain: number, intGain: number, expRequired: number}, "3": {dexGain: number, hpGain: number, strGain: number, appGain: number, dodgeGain: number, attackGain: number, spdGain: number, intGain: number, expRequired: number}, "4": {dexGain: number, hpGain: number, strGain: number, appGain: number, dodgeGain: number, attackGain: number, spdGain: number, intGain: number, expRequired: number}, "5": {dexGain: number, hpGain: number, strGain: number, appGain: number, dodgeGain: number, attackGain: number, spdGain: number, intGain: number, expRequired: number}, "6": {dexGain: number, hpGain: number, strGain: number, appGain: number, dodgeGain: number, attackGain: number, spdGain: number, intGain: number, expRequired: number}, "7": {dexGain: number, hpGain: number, strGain: number, appGain: number, dodgeGain: number, attackGain: number, spdGain: number, intGain: number, expRequired: number}, "8": {dexGain: number, hpGain: number, strGain: number, appGain: number, dodgeGain: number, attackGain: number, spdGain: number, intGain: number, expRequired: number}, "9": {dexGain: number, hpGain: number, strGain: number, appGain: number, dodgeGain: number, attackGain: number, spdGain: number, intGain: number, expRequired: number}, "10": {dexGain: number, hpGain: number, strGain: number, appGain: number, dodgeGain: number, attackGain: number, spdGain: number, intGain: number, expRequired: number}}}
 */
const defaultLevelUpTable = {
    2: {
      expRequired: 2,
      strGain: 1,
      dexGain: 2,
      spdGain: 1,
      intGain: 3,
      appGain: 1,
      dodgeGain: 1,
      attackGain: 2,
      hpGain: 2,
    },
    3: {
        expRequired: 5,
        strGain: 2,
        dexGain: 1,
        spdGain: 1,
        intGain: 5,
        appGain: 1,
        dodgeGain: 1,
        attackGain: 2,
        hpGain: 3,
    },
    4: {
        expRequired: 10,
        strGain: 3,
        dexGain: 3,
        spdGain: 1,
        intGain: 1,
        appGain: 1,
        dodgeGain: 1,
        attackGain: 2,
        hpGain: 5,
    },
    5: {
        expRequired: 20,
        strGain: 2,
        dexGain: 2,
        spdGain: 1,
        intGain: 0,
        appGain: 2,
        dodgeGain: 1,
        attackGain: 2,
        hpGain: 7,
    },
    6: {
        expRequired: 50,
        strGain: 0,
        dexGain: 5,
        spdGain: 1,
        intGain: 1,
        appGain: 2,
        dodgeGain: 1,
        attackGain: 2,
        hpGain: 12,
    },
    7: {
        expRequired: 100,
        strGain: 1,
        dexGain: 1,
        spdGain: 1,
        intGain: 0,
        appGain: 2,
        dodgeGain: 1,
        attackGain: 2,
        hpGain: 19,
    },
    8: {
        expRequired: 250,
        strGain: 1,
        dexGain: 0,
        spdGain: 1,
        intGain: 6,
        appGain: 3,
        dodgeGain: 1,
        attackGain: 2,
        hpGain: 25,
    },
    9: {
        expRequired: 780,
        strGain: 2,
        dexGain: 0,
        spdGain: 0,
        intGain: 2,
        appGain: 3,
        dodgeGain: 1,
        attackGain: 2,
        hpGain: 35,
    },
    10: {
        expRequired: 2850,
        strGain: 6,
        dexGain: 7,
        spdGain: 9,
        intGain: 1,
        appGain: 4,
        dodgeGain: 1,
        attackGain: 2,
        hpGain: 50,
    }
};

/**
 * This function returns the number of xp required to level up
 *
 * @function expRequired
 * @param {string} lvl - The current level
 * @return {number}
 */
function expRequired(lvl)
{
    if(lvl < 10) return defaultLevelUpTable[lvl+1].expRequired;
    else return 0;
}

/**
 * This function increases a player's level
 *
 * @function levelUp
 * @param {Participant} player - The player who levels up
 * @param {boolean} local - If true, do not save the changes to the db - only update locally
 * @return {void}
 */
function levelUp(player, local = false)
{
    if(player.level < 10) {
        player.level += 1;
        //player.strength += defaultLevelUpTable[player.level].strGain;
        //player.dexterity += defaultLevelUpTable[player.level].dexGain;
        //player.intelligence += defaultLevelUpTable[player.level].intGain;
        //player.appearance += defaultLevelUpTable[player.level].appGain;
        player.speed += defaultLevelUpTable[player.level].spdGain;
        player.dodge += defaultLevelUpTable[player.level].dodgeGain;
        player.attack += defaultLevelUpTable[player.level].attackGain;
        player.maxHealth += defaultLevelUpTable[player.level].hpGain;
        player.armor += 1;
        player.experience = 0;

        if(!local)
            updateParticipant(player, "player");
    }
    else newSystemCall("Gracz posiada już maksymalny poziom!");
}

/**
 * This function decreases a player's level
 *
 * @function levelDown
 * @param {Participant} player - The player who levels down
 * @param {boolean} local - If true, do not save the changes to the db - only update locally
 * @return {void}
 */
function levelDown(player, local = false)
{
    if(player.level > 1) {
        // if(player.strength - defaultLevelUpTable[player.level].strGain > 0)
        //     player.strength -= defaultLevelUpTable[player.level].strGain;
        // else player.strength = 1;
        // if(player.dexterity - defaultLevelUpTable[player.level].dexGain > 0)
        //     player.dexterity -= defaultLevelUpTable[player.level].dexGain;
        // else player.dexterity = 1;
        // if(player.intelligence - defaultLevelUpTable[player.level].intGain > 0)
        //     player.intelligence -= defaultLevelUpTable[player.level].intGain;
        // else player.intelligence = 1;
        // if(player.appearance - defaultLevelUpTable[player.level].appGain > 0)
        //     player.appearance -= defaultLevelUpTable[player.level].appGain;
        // else player.appearance = 1;
        if(player.speed - defaultLevelUpTable[player.level].spdGain > 0)
            player.speed -= defaultLevelUpTable[player.level].spdGain;
        else player.speed = 1;
        if(player.dodge - defaultLevelUpTable[player.level].dodgeGain > 0)
            player.dodge -= defaultLevelUpTable[player.level].dodgeGain;
        else player.dodge = 1;
        if(player.attack - defaultLevelUpTable[player.level].attackGain > 0)
            player.attack -= defaultLevelUpTable[player.level].attackGain;
        else player.attack = 1;
        if(player.maxHealth - defaultLevelUpTable[player.level].hpGain > 10)
            player.maxHealth -= defaultLevelUpTable[player.level].hpGain;
        else player.maxHealth = 10;
        if(player.armor > 0)
            player.armor -= 1;
        player.experience = 0;
        player.level -= 1;

        if(!local)
            updateParticipant(player, "player");
    }
    else newSystemCall("Gracz posiada pierwszy poziom!");

}

export {expRequired, levelUp, levelDown};
