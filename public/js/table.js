import {insertCard} from "./cardPicker";
/**
 * This function adds a player card from the list into the table
 *
 * @function addPlayer
 * @param {int} index player position in the array
 * @returns {Boolean} true on success, false on failure
 */
function addPlayer(index)
{
    //check if the player is available and if not, return
    if(availablePlayers[index].inUse) {
        newSystemCall("Wybrany gracz jest już w grze.");
        return false;
    }
    else {
        Settings.playerCount++;
        availablePlayers[index].inUse = true;
        insertCard("player", structuredClone(availablePlayers[index]));
        return true;
    }
}


/**
 * This function adds an enemy card from the list into the table
 *
 * @function addEnemy
 * @param {int} index enemy position in the array
 * @return {void} calls insertCard function on call
 */
function addEnemy(index)
{
    Settings.enemyCount++;
    Settings.addedEnemiesCount++;
    let newEnemy = structuredClone(availableEnemies[index]);
    newEnemy.name = newEnemy.name + " " + Settings.addedEnemiesCount;
    insertCard("enemy", newEnemy);
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