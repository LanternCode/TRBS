import {newSystemCall} from "./action.js";
import {expRequired, levelUp} from "./level.js";
import {adjustOptions} from "./list.js";

/**
 * This function starts or resets a battle
 *
 * @function startBattle
 * @return {void}
 */
function startBattle()
{
    //Check if there is enough players and enemies to start the battle
    let participantsOK = playerCount > 0 && enemyCount > 0;

    //Check if there are not any cards being edited
    let cardsOK = document.getElementsByTagName("input").length === 0;

    if(participantsOK && cardsOK)
    {
        //reset the turn counters
        localTurn = 0;
        globalTurn = 1;

        //reset priority
        priorityTwo = true;
        priorityTwoActionFlag.classList.remove("disabled");
        priorityThree = true;
        priorityThreeActionFlag.classList.remove("disabled");

        //disable the buttons that add or remove participants
        for (let elem of document.getElementsByClassName("addCardButton"))
            elem.classList.toggle("hidden");
            document.getElementById("enemyAddSection").classList.toggle("hidden");
            document.getElementById("playerAddSection").classList.toggle("hidden");

        //enable the act button
        document.getElementById("actButton").classList.toggle("hidden");

        //reset the current action
        action.value = "none";

        //hide experience
        for (let elem of document.getElementsByClassName("experienceValue"))
            elem.classList.toggle("hidden");
        for (let elem of document.getElementsByClassName("experienceLabel"))
            elem.classList.toggle("hidden");

        //hide the edit participant button
        for (let elem of document.getElementsByClassName("editButton"))
            elem.classList.toggle("hidden");

        //generate the local participants array to be used during the battle
        participants = structuredClone(participantsDefinition);

        //sort the array by speed to establish turn order
        participants.sort((a, b) => b.speed - a.speed);

        //Update the battle state description
        document.getElementById("battleStatus").innerText = "W trakcie!";

        //Hide the start battle button and show the next turn button
        document.getElementById("startBattleButton").classList.toggle("hidden");
        document.getElementById("nextTurnButton").classList.toggle("hidden");

        //Update the "acts now" label
        document.getElementById("nowActsDesc").innerText = participants[0].name;

        //Reset the targets list
        let targetSlot = document.getElementById("targetsList");
        targetSlot.innerHTML = '';
        //Reset participant's hp to its max value (for battle resets)
        for(let i = 0; i < participants.length; ++i)
        {
            participants[i].health = participants[i].maxHealth;
        }

        //hide all sections at the start
        adjustOptions(true);

        //prepare cards
        refreshBattleSlots();
    }
    else {
        //show a message on screen saying why you cannot start the battle now
        let call = "Nie udało się rozpocząć walki ponieważ";
        if(!participantsOK) call += " w walce musi brać udział minimum 1 gracz i przeciwnik";
        if(!participantsOK && !cardsOK) call += " |oraz|";
        if(!cardsOK) call += " obecnie trwa edytowanie karty gracza lub przeciwnika";
        newSystemCall(call);
    }
}

/**
 * This function refreshes cards on screen to reflect changes
 *
 * @function refreshBattleSlots
 * @return {void}
 */
function refreshBattleSlots()
{
    let playersUpdated = 0;
    let enemiesUpdated = 0;

    //Prepare the battle slots
    for(let i = 0; i < participants.length; ++i)
    {
        let battleSlot = "";
        //find the correct battle slot
        if(participants[i].type === "player")
        {
            battleSlot = document.getElementById("playerSlots").children[playersUpdated+1];
            playersUpdated++;
        }
        else if(participants[i].type === "enemy")
        {
            battleSlot = document.getElementById("enemySlots").children[enemiesUpdated+1];
            enemiesUpdated++;
        }
        //hide the edit button
        battleSlot.children[0].innerText = participants[i].name + " [" + participants[i].dodge + "]";
        battleSlot.children[2].innerText = participants[i].health;
        battleSlot.children[4].innerText = participants[i].speed;
        battleSlot.children[6].innerText = participants[i].atk;
        battleSlot.children[8].innerText = participants[i].dodge;
        if(participants[i].type === "player"){
            battleSlot.children[10].innerText = participants[i].experience + " / " + expRequired(participants[i].level);
        }
    }
}

/**
 * This function refreshes cards on screen back with their definitions on battle end
 *
 * @function refreshDefinitions
 * @return {void}
 */
function refreshDefinitions()
{
    let playersUpdated = 0;
    let enemiesUpdated = 0;

    //Prepare the battle slots
    for(let i = 0; i < participantsDefinition.length; ++i)
    {
        let battleSlot = "";
        //find the correct battle slot
        if(participantsDefinition[i].type === "player")
        {
            battleSlot = document.getElementById("playerSlots").children[playersUpdated+1];
            playersUpdated++;
        }
        else if(participantsDefinition[i].type === "enemy")
        {
            battleSlot = document.getElementById("enemySlots").children[enemiesUpdated+1];
            enemiesUpdated++;
        }
        //update the display properties
        battleSlot.children[0].innerText = participantsDefinition[i].name;
        battleSlot.children[2].innerText = participantsDefinition[i].health;
        battleSlot.children[4].innerText = participantsDefinition[i].speed;
        battleSlot.children[6].innerText = participantsDefinition[i].atk;
        battleSlot.children[8].innerText = participantsDefinition[i].dodge;
        if(participantsDefinition[i].type === "player"){
            battleSlot.children[10].innerText = participantsDefinition[i].experience + " / " + expRequired(participantsDefinition[i].level);
        }
    }
}

/**
 * This function ends the battle
 *
 * @function endBattle
 * @param {string} identifier - a char "p" or "e" that identifies who lost the battle
 * @return {void}
 */
function endBattle(identifier)
{
    //Update the "acts now" label
    document.getElementById("nowActsDesc").innerText = "-";

    //Update the battle state description
    document.getElementById("battleStatus").innerText = "Zakończona zwycięstwem " + (identifier === "e" ? "Graczy!" : "Przeciwników!");

    //change the next turn button into reset battle
    document.getElementById("nextTurnButton").classList.toggle("hidden");
    document.getElementById("startBattleButton").classList.toggle("hidden");

    //hide the act button
    document.getElementById("actButton").classList.toggle("hidden");

    //enable the buttons that add new participants
    document.getElementById("enemyAddSection").classList.toggle("hidden");
    document.getElementById("playerAddSection").classList.toggle("hidden");
    for (let elem of document.getElementsByClassName("addCardButton"))
        elem.classList.toggle("hidden");

    //show the edit participant button
    for (let elem of document.getElementsByClassName("editButton"))
        elem.classList.toggle("hidden");

    //give players xp after the battle
    if(identifier === "e"){
        for (let player of participants.filter(participant => participant.type === "player")) {
            if(player.health > 0){
                //match the battle participant to their external definition
                for(let playerDefinition of participantsDefinition.filter(p => p.type === "player")) {
                    if(player.name === playerDefinition.name) {
                        playerDefinition.experience++;
                        if(playerDefinition.experience >= expRequired(playerDefinition.level))
                        {
                            levelUp(playerDefinition);
                        }
                    }
                }
            }
        }
    }

    //display experience labels
    for (let elem of document.getElementsByClassName("experienceValue"))
        elem.classList.toggle("hidden");
    for (let elem of document.getElementsByClassName("experienceLabel"))
        elem.classList.toggle("hidden");

    //refresh cards to definitions
    refreshDefinitions();
}

/**
 * This function checks if the battle has ended or not
 *
 * @function isBattleOver
 * @return {boolean} calls {@link endBattle} if the condition is met and a confirmation
 */
function isBattleOver()
{
    //check if all enemies or all players are down
    let playersDown = participants.filter(participant => participant.type === "player").every(p => p.health === 0);
    let enemiesDown = participants.filter(participant => participant.type === "enemy").every(p => p.health === 0);

    if(playersDown) {
        endBattle("p");
        return true;
    }
    else if(enemiesDown) {
        endBattle("e");
        return true;
    }
    else return false;
}

export {startBattle, refreshBattleSlots, endBattle, isBattleOver, refreshDefinitions};
