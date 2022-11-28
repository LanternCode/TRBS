import {newSystemCall} from "./action.js";
import {expRequired, levelDown, levelUp} from "./level.js";

/**
 * This function checks if new participants can be added into battle and if so,
 * opens the card picker. Called by pressing the plus button on the left.
 *
 * @generator
 * @function addCard
 * @param {string} type participant's type
 * @return {void} immediately calls {@link displayCardPicker} on success
 */
function addCard(type)
{
    //check if more participants can be added onto the table
    if(type === "player"){
        if(playerCount === 4) {
            newSystemCall("Nie udało się dodać nowego gracza ponieważ limit to 4.");
            return;
        }
    }
    else if(type === "enemy") {
        if(enemyCount === 9) {
            newSystemCall("Nie udało się dodać nowego przeciwnika ponieważ limit to 9.");
            return;
        }
    }

    displayCardPicker(type);
}

/**
 * This function displays the list with available participant cards
 * for the user to choose from
 *
 * @generator
 * @function displayCardPicker
 * @param {string} type participant type
 * @yields {Element} a Participant card added to the table
 */
function displayCardPicker(type)
{
    let pickingOverlay = document.getElementById("pickingOverlay");

    //insert participants of the 'type' into the card picker
    let selectSection = refreshCardList(type, true);

    //attach styles to the select section
    selectSection.classList.add("cardListFrame");
    selectSection.id = "listSection";

    //reveal the card picker
    pickingOverlay.appendChild(selectSection);
    pickingOverlay.classList.remove("hidden");
}

/**
 * Takes the card list and refreshes it or generates it for the first time
 *
 * @function refreshCardList
 * @param {string} cardType the type of list (player/enemy list)
 * @param {boolean} firstUse whether to generate the list for the first time
 * @returns {HTMLElement | void} For the first time return a valid section element, void otherwise
 */
function refreshCardList(cardType, firstUse = false)
{
    //fetch or create the card picker selection list
    let cardList = (cardType === "player" ? availablePlayers : availableEnemies);
    let selectSection;
    if(firstUse)
        selectSection = document.createElement('section');
    else {
        selectSection = document.getElementById("listSection");
        selectSection.innerHTML = "";
    }

    //insert each available participant into the list
    for (let i = 0; i < cardList.length; i++) {
        let index = i;
        let option = createCardTemplate(cardType, cardList[i]);
        option.id = "participant-" + i;
        let btnPickCard = document.createElement('button');
        btnPickCard.innerText = "Wybierz!";
        btnPickCard.addEventListener("click", function() {
            if(cardType === "player") {
                addPlayer(index);
            }
            else if (cardType === "enemy") {
                addEnemy(index);
            }
        }, false);
        option.classList.add("clickOnMe");

        option.appendChild(btnPickCard);
        selectSection.appendChild(option);
    }

    //create the settings card and append it at the end
    let settings = createSettingsCard(cardType);
    selectSection.appendChild(settings);

    if (firstUse)
        return selectSection;
}

/**
 * This function constructs a participant card template
 *
 * @generator
 * @function createCardTemplate
 * @param {string} type player/enemy
 * @param {Participant} newParticipant a {@link Participant} object
 * @yields {Element} a valid participant card template <section> element
 */
function createCardTemplate(type, newParticipant)
{
    //Create elements used by both players and enemies
    let card = document.createElement("section");
    let participantName = document.createElement("h3");
    let healthLabel = document.createElement("label");
    let healthValue = document.createElement("h4");
    let speedLabel = document.createElement("label");
    let speedValue = document.createElement("h4");
    let attackLabel = document.createElement("label");
    let attackValue = document.createElement("h4");
    let dodgeLabel = document.createElement("label");
    let dodgeValue = document.createElement("h4");
    let armorLabel = document.createElement("label");
    let armorValue = document.createElement("h4");

    //add the attributes to the card
    card.className = type === "player" ? "playerSection" : "enemySection";
    participantName.innerText = newParticipant.name + " [" +
        newParticipant.dodge + "]";
    healthLabel.innerText = "HP:";
    healthValue.innerText = newParticipant.health;
    speedLabel.innerText = "Szybkość:";
    speedValue.innerText = newParticipant.speed;
    attackLabel.innerText = "Atak:";
    attackValue.innerText = newParticipant.atk;
    dodgeLabel.innerText = "Unik:";
    dodgeLabel.classList.add("outOfBattleElem");
    dodgeValue.innerText = newParticipant.dodge;
    dodgeValue.classList.add("outOfBattleElem");
    armorLabel.innerText = "Pancerz:";
    armorValue.innerText = newParticipant.armor;

    //append all elements in the right order
    card.appendChild(participantName);
    card.appendChild(healthLabel);
    card.appendChild(healthValue);
    card.appendChild(speedLabel);
    card.appendChild(speedValue);
    card.appendChild(attackLabel);
    card.appendChild(attackValue);
    card.appendChild(dodgeLabel);
    card.appendChild(dodgeValue);
    card.appendChild(armorLabel);
    card.appendChild(armorValue);

    //add player-only elements (lvl and exp)
    if(type === "player"){
        let lvlLabel = document.createElement("label");
        let lvlValue = document.createElement("h4");
        let experienceLabel = document.createElement("label");
        let experienceValue = document.createElement("h4");
        let lvlUpButton = document.createElement("button");
        lvlUpButton.innerText = "+";
        let lvlDownButton = document.createElement("button");
        lvlDownButton.innerText = "-";
        //check if we're in the list or editing on the table
        let inList;
        lvlUpButton.onclick = function(){
            levelUp(newParticipant);
            inList = this.parentNode.classList.contains("clickOnMe");
            if(inList)
                refreshCardList("player");
            else refreshCardsInBattle(true);
        };
        lvlDownButton.onclick = function(){
            levelDown(newParticipant);
            inList = this.parentNode.classList.contains("clickOnMe");
            if(inList)
                refreshCardList("player");
            else refreshCardsInBattle(true);
        };

        lvlLabel.classList.add("outOfBattleElem", "blockDisp", "displayAfterBattle");
        lvlValue.classList.add("outOfBattleElem", "inlineBlockDisp", "displayAfterBattle");
        experienceLabel.classList.add("outOfBattleElem", "blockDisp", "displayAfterBattle");
        experienceValue.classList.add("outOfBattleElem", "displayAfterBattle");
        lvlUpButton.classList.add("outOfBattleElem", "lvlButton");
        lvlDownButton.classList.add("outOfBattleElem", "lvlButton");

        lvlLabel.innerText = "Level:";
        lvlValue.innerText = newParticipant.level;
        experienceLabel.innerText = "Doświadczenie:";
        experienceValue.innerText = newParticipant.experience + " / " + expRequired(newParticipant.level);

        card.appendChild(lvlLabel);
        card.appendChild(lvlDownButton);
        card.appendChild(lvlValue);
        card.appendChild(lvlUpButton);
        card.appendChild(experienceLabel);
        card.appendChild(experienceValue);
    }
    else if(type === "enemy"){
        //add enemy-only elements (zone)
        let zoneLabel = document.createElement("label");
        let zoneValue = document.createElement("h4");

        zoneLabel.classList.add("outOfBattleElem");
        zoneValue.classList.add("outOfBattleElem");

        zoneLabel.innerText = "Strefa:";
        zoneValue.innerText = newParticipant.zone;

        card.appendChild(zoneLabel);
        card.appendChild(zoneValue);
    }

    //create functional buttons for the card
    let editButton = document.createElement("button");
    let saveButton = document.createElement("button");
    let cancelButton = document.createElement("button");
    let deleteCardButton = document.createElement("button");
    editButton.innerText = "Edytuj";
    editButton.className = "editButton";
    editButton.onclick = function(){
        editCard(this);
    };
    saveButton.innerText = "Zapisz";
    saveButton.className = "hidden";
    saveButton.onclick = function(){
        saveCard(this);
    };
    cancelButton.innerText = "Cofnij";
    cancelButton.className = "hidden";
    cancelButton.onclick = function(){
        cancelEdit(this);
    };
    deleteCardButton.innerText = "Usuń uczestnika";
    deleteCardButton.className = "hidden";
    deleteCardButton.onclick = function(){
        deleteCard(this);
    };

    //append the buttons at the end
    card.appendChild(editButton);
    card.appendChild(saveButton);
    card.appendChild(cancelButton);
    card.appendChild(deleteCardButton);

    return card;
}

/**
 * This function completes the construction of a participant card
 * and adds that card to the table or to the list
 *
 * @generator
 * @function insertCard
 * @param {string} type participant's type
 * @param {Participant} newParticipant the participant being added
 * @param {string} location where to add the card (table/list)
 * @yields {Element} a valid participant card <section> element
 */
function insertCard(type, newParticipant, location = "table")
{
    if(location === "table")
        participantsDefinition = participantsDefinition.concat(newParticipant);
    else {
        //TODO: Insert the new participant into the database
        if(type === "player") availablePlayers = availablePlayers.concat(newParticipant);
        else availableEnemies = availableEnemies.concat(newParticipant);
    }

    let card = createCardTemplate(type, newParticipant);
    card.id = "participant-" + (participantsDefinition.length-1);

    //append the card to the list or the correct side of the board
    if(location === "list") {
        document.getElementById("listSection").appendChild(card);
    }
    else if(type === "player"){
        document.getElementById("playerSlots").appendChild(card);
    }
    else if(type === "enemy"){
        document.getElementById("enemySlots").appendChild(card);
    }
}

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
        playerCount++;
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
    enemyCount++;
    let newEnemy = structuredClone(availableEnemies[index]);
    newEnemy.name +=  " " + enemyCount;
    insertCard("enemy", newEnemy);
}

/**
 * This function generates an enemy to be inserted into the list
 *
 * @generator
 * @function generateNewEnemy
 * @yields {Participant} The {@link Participant} generated
 */
function generateNewEnemy()
{
    let enemy = {
        name: "Przeciwnik",
        isDodging: 0,
        type: "enemy",
        subtype: Math.random() < 0.5 ? "human" : "monster"
    };

    for (let enemyStat of Object.keys(enemyStatLimits)) {
        enemy[enemyStat] = getRndInteger(enemyStatLimits[enemyStat].min, enemyStatLimits[enemyStat].max);
    }
    enemy.maxHealth = enemy.health;

    if(enemy.subtype === "human") enemy.itemsOwned = generateRandomItems();

    return enemy;
}

/**
 * This function generates a player to be inserted into the list
 * for now using a template, to be expanded in later phases
 *
 * @generator
 * @function generateNewPlayer
 * @yields {Participant} The {@link Participant} generated
 */
function generateNewPlayer()
{
    let player = {
        name: "Gracz",
        maxHealth: 100,
        isDodging: 0,
        type: "player",
        health: 100,
        speed: 70,
        atk: 32,
        dodge: 45,
        experience: 0,
        itemsOwned: generateRandomItems(),
        skillsOwned: {"3": 0},
        level: 1,
        armor: 2,
        inUse: false
    };

    return player;
}

/**
 * Creates a special card with only settings to be appended at the end
 * of the participants list
 *
 * @generator
 * @function createSettingsCard
 * @param {string} type card type (to inherit styles)
 * @yields {HTMLElement} valid section element
 */
function createSettingsCard(type)
{
    let card = document.createElement("section");
    card.className = type === "player" ? "playerSection" : "enemySection";
    let addParticipantH3 = document.createElement("h3");
    addParticipantH3.innerText = type === "player" ? "Dodaj Gracza:" : "Dodaj Przeciwnika:";
    let addParticipantButton = document.createElement("button");
    addParticipantButton.className = "cardPickerButton";
    addParticipantButton.innerText = "+";
    addParticipantButton.onclick = function(){
        let newParticipant;
        if(type === "player") newParticipant = generateNewPlayer();
        else newParticipant = generateNewEnemy();
        insertCard(type, newParticipant, "list");
        refreshCardList(type);
    };
    let closeListH3 = document.createElement("h3");
    closeListH3.innerText = "Zamknij listę:";
    let closeListButton = document.createElement("button");
    closeListButton.className = "cardPickerButton";
    closeListButton.innerText = "✖";
    closeListButton.onclick = function(){
        pickingOverlay.classList.add("hidden");
        pickingOverlay.removeChild(pickingOverlay.firstChild);
    };

    card.appendChild(addParticipantH3);
    card.appendChild(addParticipantButton);
    card.appendChild(closeListH3);
    card.appendChild(closeListButton);

    return card;
}

/**
 * This function deletes a participant card from the list or the table
 *
 * @function deleteCard
 * @param {Element} e - The button on-click event passes the button element here
 * @return {void}
 */
 function deleteCard(e)
 {
     //Get the card element
     let card = e.parentNode;
     //Figure out the card type
     let type = card.classList.contains("enemySection") ? "enemy" : "player";
     //Figure out the card location
     let location = card.classList.contains("clickOnMe") ? "list" : "table";
     //Get the participant id
     let pId = card.id.split('-')[1];
     //Remove the participant card from the table
     let sectionId = location === "table" ? (type + "Slots") : "listSection";
     let section = document.getElementById(sectionId);
     section.removeChild(card);
     //Remove the participant from the participants array and reduce the counter if removing from the table
     let arrayOfChoice = location === "table" ? participantsDefinition : (type === "player" ? availablePlayers : availableEnemies);
     //TODO: Remove the participant from the database if removing from the list
     if(location === "list") {
         arrayOfChoice.splice(pId, 1);
     }
     else if(type === "player")
     {
         let pName = card.children[0].textContent.split('[')[0].trim();
         let removedPlayer = arrayOfChoice.splice(arrayOfChoice.indexOf(arrayOfChoice.filter(p => p.type === "player" && p.name === pName).pop()), 1)[0];
         //if they're a player - also update their inUse property
         if(location === "table") {
             availablePlayers.filter(p => p.UID === removedPlayer.UID)[0].inUse = false;
             playerCount--;
         }
     }
     else {
         let pName = card.children[0].textContent.split('[')[0].trim();
         arrayOfChoice.splice(arrayOfChoice.indexOf(arrayOfChoice.filter(p => p.type === "enemy" && p.name === pName).pop()), 1);
         if(location === "table")
            enemyCount--;
     }
 }

 /**
  * This function edits an existing participant's card
  *
  * @function editCard
  * @param {Element} e - a valid participant card <section> element
  * @return {void}
  */
 function editCard(e)
 {
     //get the card element
     let card = e.parentNode;
     //get the card type
     let cType = card.classList.contains("enemySection") ? "enemy" : "player";
     //construct editable elements
     let healthInput = document.createElement("input");
     healthInput.type = "text";
     healthInput.value = card.children[2].innerText;
     healthInput.dataset.originalValue = card.children[2].innerText;
     let speedInput = document.createElement("input");
     speedInput.type = "text";
     speedInput.value = card.children[4].innerText;
     speedInput.dataset.originalValue = card.children[4].innerText;
     let attackInput = document.createElement("input");
     attackInput.type = "text";
     attackInput.value = card.children[6].innerText;
     attackInput.dataset.originalValue = card.children[6].innerText;
     let dodgeInput = document.createElement("input");
     dodgeInput.type = "text";
     dodgeInput.value = card.children[8].innerText;
     dodgeInput.dataset.originalValue = card.children[8].innerText;
     let armorInput = document.createElement("input");
     armorInput.type = "text";
     armorInput.value = card.children[10].innerText;
     armorInput.dataset.originalValue = card.children[10].innerText;
     //replace the text elements with text forms to allow editing
     card.replaceChild(healthInput, card.children[2]);
     card.replaceChild(speedInput, card.children[4]);
     card.replaceChild(attackInput, card.children[6]);
     card.replaceChild(dodgeInput, card.children[8]);
     card.replaceChild(armorInput, card.children[10]);
     //players and enemies may have dedicated elements only they can access
     if(cType === "enemy"){
         let zoneInput = document.createElement("input");
         zoneInput.type = "text";
         zoneInput.value = card.children[12].innerText;
         zoneInput.dataset.originalValue = card.children[12].innerText;
         card.replaceChild(zoneInput, card.children[12]);
     }
     else {
         card.children[12].classList.toggle("hidden");
         card.children[14].classList.toggle("hidden");
     }
     //players and enemies have different button placement
     let buttonsStartHere = cType === "enemy" ? 13 : 17;
     //hide the edit button
     card.children[buttonsStartHere].classList.toggle("hidden");
     //enable the save, cancel and drop buttons
     card.children[buttonsStartHere+1].classList.toggle("hidden");
     card.children[buttonsStartHere+2].classList.toggle("hidden");
     card.children[buttonsStartHere+3].classList.toggle("hidden");
 }

 /**
  * This function saves an updated participant's card
  *
  * @function saveCard
  * @param {Element} e - a valid participant card <section> element
  * @return {void}
  */
 function saveCard(e)
 {
     //get the card element
     let card = e.parentNode;
     //get the card type
     let cType = card.classList.contains("enemySection") ? "enemy" : "player";
     //get the location
     let cLoc = card.classList.contains("clickOnMe") ? "list" : "table";
     //get the new values
     let newName = card.children[0].innerText.split("[")[0] + "[" + card.children[8].value + "]";
     let newHealth = card.children[2].value;
     let newSpeed = card.children[4].value;
     let newAttack = card.children[6].value;
     let newDodge = card.children[8].value;
     let newArmor = card.children[10].value;
     //construct text elements
     let nameText = document.createElement("h3");
     nameText.innerText = newName;
     let healthText = document.createElement("h4");
     healthText.innerText = newHealth;
     let speedText = document.createElement("h4");
     speedText.innerText = newSpeed;
     let attackText = document.createElement("h4");
     attackText.innerText = newAttack;
     let dodgeText = document.createElement("h4");
     dodgeText.innerText = newDodge;
     dodgeText.classList.add("outOfBattleElem");
     let armorText = document.createElement("h4");
     armorText.innerText = newArmor;
     //replace the form elements with text
     card.replaceChild(nameText, card.children[0]);
     card.replaceChild(healthText, card.children[2]);
     card.replaceChild(speedText, card.children[4]);
     card.replaceChild(attackText, card.children[6]);
     card.replaceChild(dodgeText, card.children[8]);
     card.replaceChild(armorText, card.children[10]);
     //get the participant id
     let pId = card.id.split('-')[1];
     //choose the array to update
     let arrayOfChoice = cLoc === "list" ? (cType === "player" ? availablePlayers : availableEnemies) : participantsDefinition;
     //update the details in the participants array
     arrayOfChoice[pId].maxHealth = parseInt(newHealth);
     arrayOfChoice[pId].health = parseInt(newHealth);
     arrayOfChoice[pId].speed = parseInt(newSpeed);
     arrayOfChoice[pId].atk = parseInt(newAttack);
     arrayOfChoice[pId].dodge = parseInt(newDodge);
     arrayOfChoice[pId].armor = parseInt(newArmor);
     //players and enemies may have dedicated elements only they can access
     if(cType === "enemy"){
         let newZone = card.children[12].value;
         let zoneText = document.createElement("h4");
         zoneText.innerText = newZone;
         zoneText.classList.add("outOfBattleElem");
         card.replaceChild(zoneText, card.children[12]);
         arrayOfChoice[pId].zone = newZone;
     }
     else {
         card.children[12].classList.toggle("hidden");
         card.children[14].classList.toggle("hidden");
     }
     //players and enemies have different button placement
     let buttonsStartHere = cType === "enemy" ? 13 : 17;
     //enable the edit button
     card.children[buttonsStartHere].classList.toggle("hidden");
     //hide the save, cancel and drop buttons
     card.children[buttonsStartHere+1].classList.toggle("hidden");
     card.children[buttonsStartHere+2].classList.toggle("hidden");
     card.children[buttonsStartHere+3].classList.toggle("hidden");
 }

 /**
  * This function cancels editing a participant's card
  *
  * @function cancelEdit
  * @param {Element} e - a valid participant card <section> element
  * @return {void}
  */
 function cancelEdit(e)
 {
     //get the card element
     let card = e.parentNode;
     //get the card type
     let cType = card.classList.contains("enemySection") ? "enemy" : "player";
     //construct text elements
     let healthText = document.createElement("h4");
     healthText.innerText = card.children[2].dataset.originalValue;
     let speedText = document.createElement("h4");
     speedText.innerText = card.children[4].dataset.originalValue;
     let attackText = document.createElement("h4");
     attackText.innerText = card.children[6].dataset.originalValue;
     let dodgeText = document.createElement("h4");
     dodgeText.innerText = card.children[8].dataset.originalValue;
     dodgeText.classList.add("outOfBattleElem");
     let armorText = document.createElement("h4");
     armorText.innerText = card.children[10].dataset.originalValue;
     //replace the form elements with text
     card.replaceChild(healthText, card.children[2]);
     card.replaceChild(speedText, card.children[4]);
     card.replaceChild(attackText, card.children[6]);
     card.replaceChild(dodgeText, card.children[8]);
     card.replaceChild(armorText, card.children[10]);
     //players and enemies may have dedicated elements only they can access
     if(cType === "enemy"){
         let zoneText = document.createElement("h4");
         zoneText.innerText = card.children[12].dataset.originalValue;
         zoneText.classList.add("outOfBattleElem");
         card.replaceChild(zoneText, card.children[12]);
     }
     else {
         card.children[12].classList.toggle("hidden");
         card.children[14].classList.toggle("hidden");
     }
     //players and enemies have different button placement
     let buttonsStartHere = cType === "enemy" ? 13 : 17;
     //enable the edit button
     card.children[buttonsStartHere].classList.toggle("hidden");
     //hide the save, cancel and drop buttons
     card.children[buttonsStartHere+1].classList.toggle("hidden");
     card.children[buttonsStartHere+2].classList.toggle("hidden");
     card.children[buttonsStartHere+3].classList.toggle("hidden");
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
    let arrOfChoice = refreshDefs ? participantsDefinition : participants;

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

/**
 * This function generates a list of items the participant will have in battle
 *
 * @generator
 * @function generateRandomItems
 * @yields {Object} An object of {@link Item}s generated
 */
function generateRandomItems()
{
    let items = {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0
    };

    //choose two healing items and one reviving item
    let first_healing = randomOfTwo('1', '2');
    let second_healing = randomOfTwo('3', '4');
    let first_reviving = '5';

    //increase the item count in the items array
    items[first_healing]++;
    items[second_healing]++;
    items[first_reviving]++;

    return items;
}

/**
 * This function returns a random item of the two given
 *
 * @function randomOfTwo
 * @param {any} first - The beginning of the range
 * @param {any} second - The end of the range
 * @return {any} The item generated
 */
window.randomOfTwo = function(first, second) {
    return Math.random() < 0.5 ? first : second;
}

export {addCard, editCard, saveCard, cancelEdit, refreshCardsInBattle, generateRandomItems, generateNewEnemy};
