import {newSystemCall, randomSystemRoll} from "./utils.js";
import {expRequired, levelUp} from "./level.js";
import {adjustOptions} from "./list.js";
import {flipTable, refreshCardsInBattle} from "./table.js";
import {Settings} from "./settings.js";
import {experienceUp} from "./db.js";
import {Status} from "./status.js";
import {createCardTemplate} from "./card.js";

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
        //Reset the turn counters
        Settings.localTurn = 0;
        Settings.globalTurn = 1;

        //Reset priorities
        Settings.priorityTwo = true;
        document.getElementById("priorityTwoActionFlag").classList.remove("disabled");
        Settings.priorityThree = true;
        document.getElementById("priorityThreeActionFlag").classList.remove("disabled");

        //Disable the buttons that add or remove participants
        for (let elem of document.getElementsByClassName("createCardButton"))
            elem.classList.toggle("hidden");
            document.getElementById("enemyAddSection").classList.toggle("hidden");
            document.getElementById("playerAddSection").classList.toggle("hidden");

        //Show the controls in battle
        document.getElementById("sideSection--battleControls").classList.toggle("hidden");

        //Reset the current action
        document.getElementById("actionList").value = "none";

        //Hide out-of-battle labels when entering battle
        for (let elem of document.getElementsByClassName("outOfBattleElem"))
            elem.classList.toggle("hidden");

        //show in-battle labels when entering battle
        for (let elem of document.getElementsByClassName("inBattleElem"))
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
        //Advance all statuses with effects at the end of local turn
        Status.advanceLocalStatuses("end");

        //Update the local turn counter
        Settings.localTurn++;

        let battleOrder = document.getElementById("battleOrder");
        battleOrder.textContent = '';

        //Check if this was the last local turn of the global turn
        if(Settings.localTurn === Settings.participants.length)
        {
            Settings.localTurn = 0;
            Settings.globalTurn++;

            document.getElementById("globalTurn").innerText = Settings.globalTurn;
            newSystemCall("Nowa tura globalna: " + Settings.globalTurn);

            //Reduce skill cooldown for any skill by 1
            for (let i = 0; i < Settings.participants.length; ++i) {
                //Check if participant has any skills
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
            //Update the battle order indicator
            let participantIndicator = document.createElement("li");
            participantIndicator.innerText = Settings.participants[i].name;
            if(i === Settings.localTurn) participantIndicator.classList.add("current");
            battleOrder.appendChild(participantIndicator);
        }

        //If the member was dodging, disable their dodge once their turn starts again
        //This has to be disabled now in case a defeated member was revived
        Settings.participants[Settings.localTurn].isDodging = 0;

        //process the "bomb debuff" status
        let activeOnStartTurnStatuses = Status.getParticipantsPersistentStatuses(Settings.participants[Settings.localTurn], "onStartTurn");
        if(activeOnStartTurnStatuses.includes("bombDebuff")) {
            //bomb debuff kills the player if they fail a d20 > 12 roll 3 turns in a row
            let hitCheck = randomSystemRoll(20);
            if(hitCheck > 12) {
                Status.voidStatus(Settings.participants[Settings.localTurn], {"name":"bombDebuff"});
                newSystemCall("Uczestnik " + Settings.participants[Settings.localTurn].name + " nie jest już celem statusu bomba");
            }
            else {
                let bombStatusLength = Settings.participants[Settings.localTurn].statusesApplied.filter(s => s.name === "bombDebuff")[0].length;
                Status.advancePersistentStatus(Settings.participants[Settings.localTurn], "bombDebuff");
                if(bombStatusLength <= 1) {
                    //the length will have dropped to 0 - kill the player
                    Settings.participants[Settings.localTurn].health = 0;
                    newSystemCall(Settings.participants[Settings.localTurn].name + " WYBUCHŁ! KABOOM!");
                }
            }
        }
        //process the "liquid silver" status
        let freeLiquidSilver = Status.getParticipantStatus(Settings.participants[Settings.localTurn], {"name":"liquidSilver"}) === false;
        if(!freeLiquidSilver)
            Status.applyStatus(Settings.participants[Settings.localTurn], Settings.statuses.filter(s => s.name === "liquidSilverFree")[0]);

        //Check if the participant is alive, if not, void all their non-special statuses and start next turn
        if(Settings.participants[Settings.localTurn].health === 0) {
            Status.voidParticipantStatuses(Settings.participants[Settings.localTurn]);
            startNextTurn();
        }

        //see if the player is stunned
        let playerStunned = !(Status.getParticipantStatus(Settings.participants[Settings.localTurn], {"name":"stun"}) === false);

        //Turn has changed - Advance all statuses with effects at the start of local turn
        Status.advanceLocalStatuses("start");

        //if the player is stunned, skip to the next turn
        if(playerStunned) {
            startNextTurn();
        }

        //Reset the action list
        adjustOptions("reset");

        //Reset the available action flags
        let priorityTwoActionFlag = document.getElementById("priorityTwoActionFlag");
        let priorityThreeActionFlag = document.getElementById("priorityThreeActionFlag");
        priorityTwoActionFlag.classList.remove("disabled");
        priorityThreeActionFlag.classList.remove("disabled");
        Settings.priorityTwo = true;
        Settings.priorityThree = true;

        //Announce the new turn in the history
        newSystemCall("Teraz tura: " +  Settings.participants[Settings.localTurn].name);

        //Update the "acts now" label
        document.getElementById("nowActsDesc").innerText = Settings.participants[Settings.localTurn].name;

        refreshCardsInBattle();
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

/**
 * Once a battle has finished, a summary is shown - this ends the summary and opens the out-of-battle overlay
 *
 * @function continueToBattle
 * @return {void}
 */
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

    //hide in-battle labels when exiting battle
    for (let elem of document.getElementsByClassName("inBattleElem"))
        elem.classList.toggle("hidden");

    //hide the "continue to battle" button, show the start battle button
    document.getElementById("startBattleButton").classList.toggle("hidden");
    document.getElementById("continueToBattleButton").classList.toggle("hidden");

    //clear the battle history
    document.getElementById("systemCall").textContent = '';
    document.getElementById("battleOrder").textContent = '';

    //refresh cards to definitions
    refreshCardsInBattle(true);
}

/**
 * The function is invoked when a button to load the default template is pressed
 *
 * @function loadDefaultTemplate
 * @return void
 */
async function loadDefaultTemplate() {

    //Clear the table
    flipTable();

    //Fetch new definitions in case the list was not loaded before
    await Settings.fetchPlayers();
    await Settings.fetchEnemies();

    //Load the participants into the definitions
    Settings.participantsDefinition = Settings.participantsDefinition.concat(Settings.availablePlayers[1]);
    Settings.participantsDefinition = Settings.participantsDefinition.concat(Settings.availablePlayers[3]);
    Settings.participantsDefinition = Settings.participantsDefinition.concat(Settings.availableEnemies[0]);
    Settings.participantsDefinition = Settings.participantsDefinition.concat(Settings.availableEnemies[1]);
    Settings.participantsDefinition = Settings.participantsDefinition.concat(Settings.availableEnemies[2]);

    //Construct and append the cards
    let defaultCardOne = createCardTemplate("player", Settings.participantsDefinition[0]);
    let defaultCardTwo = createCardTemplate("player", Settings.participantsDefinition[1]);
    let defaultCardThree = createCardTemplate("enemy", Settings.participantsDefinition[2]);
    let defaultCardFour = createCardTemplate("enemy", Settings.participantsDefinition[3]);
    let defaultCardFive = createCardTemplate("enemy", Settings.participantsDefinition[4]);
    defaultCardOne.id = "participant-0";
    defaultCardTwo.id = "participant-1";
    defaultCardThree.id = "participant-2";
    defaultCardFour.id = "participant-3";
    defaultCardFive.id = "participant-4";
    document.getElementById("playerSlots").appendChild(defaultCardOne);
    document.getElementById("playerSlots").appendChild(defaultCardTwo);
    document.getElementById("enemySlots").appendChild(defaultCardThree);
    document.getElementById("enemySlots").appendChild(defaultCardFour);
    document.getElementById("enemySlots").appendChild(defaultCardFive);

    //Set the counters to the default template values
    Settings.playerCount = 2;
    Settings.enemyCount = 3;
}

export {startBattle, endBattle, isBattleOver, continueToBattle, startNextTurn, loadDefaultTemplate};
