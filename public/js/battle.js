import {newSystemCall} from "./utils.js";
import {expRequired, levelUp} from "./level.js";
import {adjustOptions} from "./list.js";
import {refreshCardsInBattle} from "./table.js";
import {Settings} from "./settings.js";
import {experienceUp} from "./db.js";
import {Status} from "./status.js";

/**
 * This function starts or resets a battle
 *
 * @function startBattle
 * @return {void}
 */
function startBattle()
{
    //Check if there is enough players and enemies to start the battle
    let participantsOK = Settings.playerCount > 0 && Settings.enemyCount > 0;

    //Check that no cards are being edited
    let cardsOK = document.getElementsByTagName("input").length < 2;

    if(participantsOK && cardsOK)
    {
        //reset the turn counters
        Settings.localTurn = 0;
        Settings.globalTurn = 1;

        //reset priority
        Settings.priorityTwo = true;
        priorityTwoActionFlag.classList.remove("disabled");
        Settings.priorityThree = true;
        priorityThreeActionFlag.classList.remove("disabled");

        //disable the buttons that add or remove participants
        for (let elem of document.getElementsByClassName("createCardButton"))
            elem.classList.toggle("hidden");
            document.getElementById("enemyAddSection").classList.toggle("hidden");
            document.getElementById("playerAddSection").classList.toggle("hidden");

        //show the controls in battle
        document.getElementById("sideSection--battleControls").classList.toggle("hidden");

        //reset the current action
        actionList.value = "none";

        //hide out-of-battle labels when entering battle
        for (let elem of document.getElementsByClassName("outOfBattleElem"))
            elem.classList.toggle("hidden");

        //hide the edit participant button
        for (let elem of document.getElementsByClassName("editButton"))
            elem.classList.toggle("hidden");

        //generate the local participants array to be used during the battle
        Settings.participants = structuredClone(Settings.participantsDefinition);

        //sort the array by speed to establish turn order
        Settings.participants.sort((a, b) => b.speed - a.speed);

        //Hide the start battle button and show the next turn button
        document.getElementById("startBattleButton").classList.toggle("hidden");
        document.getElementById("nextTurnButton").classList.toggle("hidden");

        //Announce history
        document.getElementById("systemCall").textContent = '';
        newSystemCall("Początek walki");
        newSystemCall("Nowa tura globalna: " + Settings.globalTurn);
        newSystemCall(`Teraz tura: ${Settings.participants[Settings.localTurn].name}`);

        //Update the "acts now" label
        document.getElementById("nowActsDesc").innerText = Settings.participants[0].name;

        //Reset the targets list
        let targetSlot = document.getElementById("targetsList");
        let battleOrder = document.getElementById("battleOrder");
        targetSlot.textContent = '';
        battleOrder.textContent = '';

        //Reset participant's hp to its max value (for battle resets)
        for(let i = 0; i < Settings.participants.length; ++i)
        {
            Settings.participants[i].health = Settings.participants[i].maxHealth;

            //show participants order
            let participantIndicator = document.createElement("li");
            participantIndicator.innerText = Settings.participants[i].name;
            if(i === 0) participantIndicator.classList.add("current");
            battleOrder.appendChild(participantIndicator);
        }

        //hide all sections at the start
        adjustOptions("reset");
        refreshCardsInBattle();
    }
    else {
        //The battle cannot be started now
        let call = "Nie udało się rozpocząć walki ponieważ";
        if(!participantsOK) call += " w walce musi brać udział minimum 1 gracz i przeciwnik";
        if(!participantsOK && !cardsOK) call += " |oraz|";
        if(!cardsOK) call += " obecnie trwa edytowanie karty gracza lub przeciwnika";
        newSystemCall(call);
    }
}

/**
 * This function ends the current local/global turn
 *
 * @function startNextTurn
 * @return {void}
 */
function startNextTurn()
{
    //check if the battle is over and end it if so, else continue
    if(!isBattleOver()){
        //update the local turn counter
        Settings.localTurn++;

        let battleOrder = document.getElementById("battleOrder");
        battleOrder.textContent = '';

        //check if this was the last local turn of the global turn
        if(Settings.localTurn === Settings.participants.length)
        {
            Settings.localTurn = 0;
            Settings.globalTurn++;

            document.getElementById("globalTurn").innerText = Settings.globalTurn;
            newSystemCall("Nowa tura globalna: " + Settings.globalTurn);

            //reduce skill cooldown for any skill by 1
            for (let i = 0; i < Settings.participants.length; ++i) {
                //check if participant has any skills
                if(Settings.participants[i].hasOwnProperty("skillsOwned")) {
                    Object.entries(Settings.participants[i].skillsOwned).forEach(
                        s => {
                            if(s[1] > 0)
                                Settings.participants[i].skillsOwned[s[0]]--;
                        }
                    );
                }
            }

            //Progress statuses effective at the end of the global turn
            Status.advanceGlobalStatuses();
        }

        for (let i = 0; i < Settings.participants.length; ++i) {
            // update the battle order indicator
            let participantIndicator = document.createElement("li");
            participantIndicator.innerText = Settings.participants[i].name;
            if(i === Settings.localTurn) participantIndicator.classList.add("current");
            battleOrder.appendChild(participantIndicator);
        }

        //if the member was dodging, disable their dodge once their turn starts again
        //this has to be disabled now in case a defeated member was revived
        Settings.participants[Settings.localTurn].isDodging = 0;

        //Check if the participant is alive, if not, start next turn
        if(Settings.participants[Settings.localTurn].health === 0) startNextTurn();

        //reset the action list
        adjustOptions("reset");

        //reset the available action flags
        let priorityTwoActionFlag = document.getElementById("priorityTwoActionFlag");
        let priorityThreeActionFlag = document.getElementById("priorityThreeActionFlag");
        priorityTwoActionFlag.classList.remove("disabled");
        priorityThreeActionFlag.classList.remove("disabled");
        Settings.priorityTwo = true;
        Settings.priorityThree = true;

        //announce the new turn in the history
        newSystemCall("Teraz tura: " +  Settings.participants[Settings.localTurn].name);

        //Update the "acts now" label
        document.getElementById("nowActsDesc").innerText = Settings.participants[Settings.localTurn].name;
    }
}

/**
 * This function ends the battle
 *
 * @function endBattle
 * @param {string} winner - a char "p" or "e" that identifies which side won the battle
 * @return {void}
 */
function endBattle(winner)
{
    //Update the "acts now" label
    document.getElementById("nowActsDesc").innerText = "-";

    //Update the battle state description
    newSystemCall("Walka zakończona zwycięstwem " + (winner === "e" ? "Przeciwników!" : "Graczy!"));

    //Hide the next turn button, show the continue to battle button
    document.getElementById("nextTurnButton").classList.toggle("hidden");
    document.getElementById("continueToBattleButton").classList.toggle("hidden");

    //hide the battle controls
    document.getElementById("sideSection--battleControls").classList.toggle("hidden");

    //give players xp after the battle
    let levelUpCall = "\n";
    if(winner === "p"){
        for (let player of  Settings.participants.filter(participant => participant.type === "player")) {
            if(player.health > 0 && player.level !== 10){
                //match the battle participant to their external definition
                for(let playerDefinition of Settings.participantsDefinition.filter(p => p.type === "player")) {
                    if(player.name === playerDefinition.name) {
                        playerDefinition.experience++;
                        if(playerDefinition.experience >= expRequired(playerDefinition.level))
                        {
                            levelUp(playerDefinition);
                            levelUpCall += `Gracz ${player.name} przeszedł na ${playerDefinition.level} poziom doświadczenia!\n`;
                        }
                        else {
                            experienceUp(player);
                        }
                    }
                }
            }
        }
    }

    refreshCardsInBattle();

    //announce the level-ups
    if(levelUpCall !== "\n")
        newSystemCall(levelUpCall);

    for (let elem of document.getElementsByClassName("displayAfterBattle")) {
        elem.classList.remove("hidden");
    }
}

/**
 * This function checks if the battle has concluded
 *
 * @function isBattleOver
 * @return {boolean} calls {@link endBattle} if the condition is met and returns a confirmation
 */
function isBattleOver()
{
    //check if all enemies or all players are down
    let playersDown = Settings.participants.filter(participant => participant.type === "player").every(p => p.health === 0);
    let enemiesDown = Settings.participants.filter(participant => participant.type === "enemy").every(p => p.health === 0);

    if(playersDown) {
        endBattle("e");
        return true;
    }
    else if(enemiesDown) {
        endBattle("p");
        return true;
    }
    else return false;
}

function continueToBattle() {
    //enable the buttons that add new participants
    document.getElementById("enemyAddSection").classList.toggle("hidden");
    document.getElementById("playerAddSection").classList.toggle("hidden");
    for (let elem of document.getElementsByClassName("createCardButton"))
        elem.classList.toggle("hidden");

    //show the edit participant button
    for (let elem of document.getElementsByClassName("editButton"))
        elem.classList.toggle("hidden");

    //show out-of-battle labels when exiting battle
    for (let elem of document.getElementsByClassName("outOfBattleElem"))
        elem.classList.remove("hidden");

    //hide the continue to battle button, show the start battle button
    document.getElementById("startBattleButton").classList.toggle("hidden");
    document.getElementById("continueToBattleButton").classList.toggle("hidden");

    //clear the battle history
    document.getElementById("systemCall").textContent = '';
    document.getElementById("battleOrder").textContent = '';

    //refresh cards to definitions
    refreshCardsInBattle(true);
}

export {startBattle, endBattle, isBattleOver, continueToBattle, startNextTurn};
