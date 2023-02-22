import {insertCard} from "./cardPicker.js";
import {Settings} from "./settings.js";
import {expRequired} from "./level.js";
import {newSystemCall} from "./action.js";
/**
 * This function adds a player card from the list into the table if the limit has not been reached
 *
 * @function addPlayer
 * @param {int} index player position in the array
 * @returns {Boolean} true on success, false on failure
 */
async function addPlayer(index)
{
    //check if the player is available and if not, return
    if(Settings.availablePlayers[index].inUse) {
        newSystemCall("Wybrany gracz jest już w grze.");
        return false;
    }
    else if(Settings.playerCount === 4) {
        newSystemCall("Nie udało się dodać nowego gracza ponieważ limit to 4.");
        return false;
    }
    else {
        Settings.playerCount++;
        Settings.availablePlayers[index].inUse = true;
        await insertCard("player", structuredClone(Settings.availablePlayers[index]));
        return true;
    }
}

/**
 * This function adds an enemy card from the list into the table if the limit has not been reached
 *
 * @function addEnemy
 * @param {int} index enemy position in the array
 * @return {void} calls insertCard function on call
 */
async function addEnemy(index)
{
    if(Settings.enemyCount === 9) {
        newSystemCall("Nie udało się dodać nowego przeciwnika ponieważ limit to 9.");
        return false;
    }
    else {
        Settings.enemyCount++;
        Settings.addedEnemiesCount++;
        let newEnemy = structuredClone(Settings.availableEnemies[index]);
        newEnemy.name = newEnemy.name + " " + Settings.addedEnemiesCount;
        await insertCard("enemy", newEnemy);
    }
}


/**
 * This function refreshes cards on screen to reflect changes
 *
 * @function refreshCardsInBattle
 * @param {boolean} [refreshDefs] whether to refresh from local array or the definitions array
 * @return {void}
 */
function refreshCardsInBattle(refreshDefs = false)
{
    //count updates so that slots do not repeat
    let playersUpdated = 0;
    let enemiesUpdated = 0;

    //choose the array to use for refreshing cards
    let arrOfChoice = refreshDefs ? Settings.participantsDefinition : Settings.participants;

    //find the correct battle slot
    for(let i = 0; i < arrOfChoice.length; ++i)
    {
        let battleSlot = "";
        if(arrOfChoice[i].type === "player")
        {
            battleSlot = document.getElementById("playerSlots").children[playersUpdated+1];
            playersUpdated++;
        }
        else if(arrOfChoice[i].type === "enemy")
        {
            battleSlot = document.getElementById("enemySlots").children[enemiesUpdated+1];
            enemiesUpdated++;
        }
        //update values in battle
        battleSlot.children[0].innerText = arrOfChoice[i].name + " [" + arrOfChoice[i].dodge + "]";
        battleSlot.children[2].innerText = arrOfChoice[i].health;
        battleSlot.children[4].innerText = arrOfChoice[i].speed;
        battleSlot.children[6].innerText = arrOfChoice[i].atk;
        battleSlot.children[8].innerText = arrOfChoice[i].dodge;
        battleSlot.children[10].innerText = arrOfChoice[i].armor;

        if(arrOfChoice[i].type === "player" && refreshDefs){
            //xp is updated in the definition only, hence refreshDefs must be true
            battleSlot.children[13].innerText = arrOfChoice[i].level;
            battleSlot.children[16].innerText = arrOfChoice[i].experience + " / " + expRequired(arrOfChoice[i].level);
        }
    }
}

export { addPlayer, addEnemy, refreshCardsInBattle };