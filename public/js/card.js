import {expRequired, levelDown, levelUp} from "./level.js";
import {Settings} from "./settings.js";
import { dropParticipant, updateParticipant} from "./db.js";
import {refreshCardList} from "./cardPicker.js";
import {refreshCardsInBattle} from "./table.js";

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
    let statusLabel = document.createElement("label");
    let statusValue = document.createElement("h4");

    //Add the attributes to the card
    card.className = type === "player" ? "playerSection" : "enemySection";
    participantName.innerText = newParticipant.name + " [" +
        newParticipant.dodge + "]";
    healthLabel.innerText = "HP:";
    healthValue.innerText = newParticipant.maxHealth;
    speedLabel.innerText = "Szybkość:";
    speedValue.innerText = newParticipant.speed;
    attackLabel.innerText = "Atak:";
    attackValue.innerText = newParticipant.attack;
    dodgeLabel.innerText = "Unik:";
    dodgeLabel.classList.add("outOfBattleElem");
    dodgeValue.innerText = newParticipant.dodge;
    dodgeValue.classList.add("outOfBattleElem");
    armorLabel.innerText = "Pancerz:";
    armorValue.innerText = newParticipant.armor;
    statusLabel.innerText = "Statusy:";
    statusLabel.classList.add("inBattleElem", "hidden");
    statusValue.innerText = "";
    statusValue.classList.add("inBattleElem", "hidden");

    //Append all elements in the right order
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
    card.appendChild(statusLabel);
    card.appendChild(statusValue);

    //Add player-only elements (lvl, exp and gold)
    if(type === "player"){
        let lvlLabel = document.createElement("label");
        let lvlValue = document.createElement("h4");
        let experienceLabel = document.createElement("label");
        let experienceValue = document.createElement("h4");
        let goldLabel = document.createElement("label");
        let goldValue = document.createElement("h4");
        let lvlUpButton = document.createElement("button");
        lvlUpButton.innerText = "+";
        let lvlDownButton = document.createElement("button");
        lvlDownButton.innerText = "-";
        //Check if we're in the list or editing on the table
        let inList;
        lvlUpButton.onclick = function(){
            inList = this.parentNode.classList.contains("clickOnMe");
            if(inList) {
                levelUp(newParticipant);
                refreshCardList("player", false);
            }
            else {
                levelUp(newParticipant, true);
                refreshCardsInBattle(true);
            }
        };
        lvlDownButton.onclick = function(){
            inList = this.parentNode.classList.contains("clickOnMe");
            if(inList) {
                levelDown(newParticipant);
                refreshCardList("player", false);
            }
            else {
                levelDown(newParticipant, true);
                refreshCardsInBattle(true);
            }
        };

        lvlLabel.classList.add("outOfBattleElem", "blockDisp", "displayAfterBattle");
        lvlValue.classList.add("outOfBattleElem", "inlineBlockDisp", "displayAfterBattle");
        experienceLabel.classList.add("outOfBattleElem", "blockDisp", "displayAfterBattle");
        experienceValue.classList.add("outOfBattleElem", "displayAfterBattle");
        goldLabel.classList.add("outOfBattleElem", "blockDisp", "displayAfterBattle");
        goldValue.classList.add("outOfBattleElem", "displayAfterBattle");
        lvlUpButton.classList.add("outOfBattleElem", "lvlButton");
        lvlDownButton.classList.add("outOfBattleElem", "lvlButton");

        lvlLabel.innerText = "Level:";
        lvlValue.innerText = newParticipant.level;
        experienceLabel.innerText = "Doświadczenie:";
        experienceValue.innerText = newParticipant.experience + " / " + expRequired(newParticipant.level);
        goldLabel.innerText = "Złoto:";
        goldValue.innerText = newParticipant.gold;

        card.appendChild(lvlLabel);
        card.appendChild(lvlDownButton);
        card.appendChild(lvlValue);
        card.appendChild(lvlUpButton);
        card.appendChild(experienceLabel);
        card.appendChild(experienceValue);
        card.appendChild(goldLabel);
        card.appendChild(goldValue);
    }
    else if(type === "enemy"){
        //Add enemy-only elements (zone)
        let zoneLabel = document.createElement("label");
        let zoneValue = document.createElement("h4");

        zoneLabel.classList.add("outOfBattleElem");
        zoneValue.classList.add("outOfBattleElem");

        zoneLabel.innerText = "Strefa:";
        zoneValue.innerText = newParticipant.zone;

        card.appendChild(zoneLabel);
        card.appendChild(zoneValue);
    }

    //Create functional buttons for the card
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

    //Append the buttons at the end
    card.appendChild(editButton);
    card.appendChild(saveButton);
    card.appendChild(cancelButton);
    card.appendChild(deleteCardButton);

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
    //Stop editing the card - it's values will be reverted to textual form
    cancelEdit(e);
    //Get the card element
    let card = e.parentNode;
    //Figure out the card type
    let type = card.classList.contains("enemySection") ? "enemy" : "player";
    //Figure out the card location
    let location = card.classList.contains("clickOnMe") ? "list" : "table";
    //Remove the participant card from the table
    let sectionId = location === "table" ? (type + "Slots") : "listSection";
    let section = document.getElementById(sectionId);
    section.removeChild(card);
    //Remove the participant from the participants array and reduce the counter if removing from the table
    let arrayOfChoice = location === "table" ? Settings.participantsDefinition : (type === "player" ? Settings.availablePlayers : Settings.availableEnemies);
    //Find the participant in the array
    let pName = card.children[0].textContent.split('[')[0].trim();
    let pId = arrayOfChoice.indexOf(arrayOfChoice.filter(p => p.name === pName)[0]);
    if(location === "list") {
        dropParticipant(arrayOfChoice[pId], type);
        arrayOfChoice.splice(pId, 1);
    }
    else if(type === "player") {
        arrayOfChoice.splice(arrayOfChoice.indexOf(arrayOfChoice.filter(p => p.type === "player" && p.name === pName).pop()), 1);
        if(location === "table")
            Settings.playerCount--;
    }
    else {
        arrayOfChoice.splice(arrayOfChoice.indexOf(arrayOfChoice.filter(p => p.type === "enemy" && p.name === pName).pop()), 1);
        if(location === "table")
            Settings.enemyCount--;
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
     //Get the card element
     let card = e.parentNode;
     //Get the card type
     let cType = card.classList.contains("enemySection") ? "enemy" : "player";
     //Construct editable elements
     let nameInput = document.createElement("input");
     nameInput.type = "text";
     nameInput.value = card.children[0].innerText.split(" [")[0];
     nameInput.dataset.originalValue = card.children[0].innerText.split("[")[0];
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
     //Replace the text elements with text forms to allow editing
     card.replaceChild(nameInput, card.children[0]);
     card.replaceChild(healthInput, card.children[2]);
     card.replaceChild(speedInput, card.children[4]);
     card.replaceChild(attackInput, card.children[6]);
     card.replaceChild(dodgeInput, card.children[8]);
     card.replaceChild(armorInput, card.children[10]);
     //Players and enemies may have dedicated elements only they can access
     if(cType === "enemy"){
         //Zone property
         let zoneInput = document.createElement("input");
         zoneInput.type = "text";
         zoneInput.value = card.children[14].innerText;
         zoneInput.dataset.originalValue = card.children[14].innerText;
         card.replaceChild(zoneInput, card.children[14]);
     }
     else {
         //Gold property
         let goldInput = document.createElement("input");
         goldInput.type = "text";
         goldInput.value = card.children[20].innerText;
         goldInput.dataset.originalValue = card.children[20].innerText;
         card.replaceChild(goldInput, card.children[20]);
         //Hide the level-up and level-down buttons
         card.children[14].classList.add("hidden");
         card.children[16].classList.add("hidden");
     }
     //Toggle the visibility of buttons
     toggleButtonsVisibility(card);
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
     //Get the card element
     let card = e.parentNode;
     //Get the card type
     let cType = card.classList.contains("enemySection") ? "enemy" : "player";
     //Get the location
     let cLoc = card.classList.contains("clickOnMe") ? "list" : "table";
     //Get the new values and re-construct common card elements
     let cardValues = [];
     let nameText = card.children[0].value;
     cardValues['nameText'] = nameText + " [" + card.children[8].value + "]";
     cardValues['healthText'] = card.children[2].value;
     cardValues['speedText'] = card.children[4].value;
     cardValues['attackText'] = card.children[6].value;
     cardValues['dodgeText'] = card.children[8].value;
     cardValues['armorText'] = card.children[10].value;
     ReconstructCommonCardElements(card, cardValues);
     //Choose the array to update
     let arrayOfChoice = cLoc === "list" ? (cType === "player" ? Settings.availablePlayers : Settings.availableEnemies) : Settings.participantsDefinition;
     //Find the participant in the array
     let pName = card.children[0].textContent.split('[')[0].trim();
     let pId = arrayOfChoice.indexOf(arrayOfChoice.filter(p => p.name === pName)[0]);
     //Update the details in the participants array
     arrayOfChoice[pId].name = nameText;
     arrayOfChoice[pId].maxHealth = parseInt(cardValues['healthText']);
     arrayOfChoice[pId].health = parseInt(cardValues['healthText']);
     arrayOfChoice[pId].speed = parseInt(cardValues['speedText']);
     arrayOfChoice[pId].attack = parseInt(cardValues['attackText']);
     arrayOfChoice[pId].dodge = parseInt(cardValues['dodgeText']);
     arrayOfChoice[pId].armor = parseInt(cardValues['armorText']);
     //Players and enemies may have dedicated elements only they can access
     if(cType === "enemy") {
         //Zone property
         let newZone = card.children[14].value;
         let zoneText = document.createElement("h4");
         zoneText.innerText = newZone;
         zoneText.classList.add("outOfBattleElem");
         card.replaceChild(zoneText, card.children[14]);
         arrayOfChoice[pId].zone = newZone;
     }
     else {
         //Gold property
         let newGold = card.children[20].value;
         let goldText = document.createElement("h4");
         goldText.innerText = newGold;
         goldText.classList.add("outOfBattleElem");
         card.replaceChild(goldText, card.children[20]);
         arrayOfChoice[pId].gold = parseInt(newGold);
         //Show the level-up and level-down buttons
         card.children[14].classList.remove("hidden");
         card.children[16].classList.remove("hidden");
     }
     //Toggle the visibility of buttons
     toggleButtonsVisibility(card);
     //Save the updated participant into the db
     if(cLoc === "list")
        updateParticipant(arrayOfChoice[pId], cType);
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
     //Get the card element
     let card = e.parentNode;
     //Get the card type
     let cType = card.classList.contains("enemySection") ? "enemy" : "player";
     //Re-construct common card elements
     let cardValues = [];
     cardValues['nameText'] = card.children[0].dataset.originalValue + " [" + card.children[8].dataset.originalValue + "]";
     cardValues['healthText'] = card.children[2].dataset.originalValue;
     cardValues['speedText'] = card.children[4].dataset.originalValue;
     cardValues['attackText'] = card.children[6].dataset.originalValue;
     cardValues['dodgeText'] = card.children[8].dataset.originalValue;
     cardValues['armorText'] = card.children[10].dataset.originalValue;
     ReconstructCommonCardElements(card, cardValues);
     //Players and enemies may have dedicated elements only they can access
     if(cType === "enemy"){
         //Zone property
         let zoneText = document.createElement("h4");
         zoneText.innerText = card.children[14].dataset.originalValue;
         zoneText.classList.add("outOfBattleElem");
         card.replaceChild(zoneText, card.children[14]);
     }
     else {
         //Gold property
         let goldText = document.createElement("h4");
         goldText.innerText = card.children[20].dataset.originalValue;
         goldText.classList.add("outOfBattleElem");
         card.replaceChild(goldText, card.children[20]);
         //Show the level-up and level-down buttons
         card.children[14].classList.remove("hidden");
         card.children[16].classList.remove("hidden");
     }
     //Toggle the visibility of buttons
     toggleButtonsVisibility(card);
 }

/**
 * The function hides and shows various card buttons during the card editing process
 *
 * @function toggleButtonsVisibility
 * @param {Element} card the participant card HTML element
 * @return {void}
 */
 function toggleButtonsVisibility(card) {
     //Identify card type (player/enemy) and location (list/table)
     let cardType = card.classList.contains("enemySection") ? "enemy" : "player";
     let cardLocation = card.classList.contains("clickOnMe") ? "list" : "table";
     //Players and enemies have different button placement
     let buttonsStartHere = cardType === "enemy" ? 15 : 21;
     //Toggle the edit and pick buttons
     card.children[buttonsStartHere].classList.toggle("hidden");
     //Toggle the save, cancel and drop buttons
     card.children[buttonsStartHere+1].classList.toggle("hidden");
     card.children[buttonsStartHere+2].classList.toggle("hidden");
     card.children[buttonsStartHere+3].classList.toggle("hidden");
     if(cardLocation === "list") {
        card.children[buttonsStartHere+4].classList.toggle("hidden");
     }

 }

/**
 *
 * @function ReconstructCommonCardElements
 * @param card
 * @param cardValues
 */
 function ReconstructCommonCardElements(card, cardValues) {
     //Construct text elements
     let nameText = document.createElement("h3");
     nameText.innerText = cardValues['nameText'];
     let healthText = document.createElement("h4");
     healthText.innerText = cardValues['healthText'];
     let speedText = document.createElement("h4");
     speedText.innerText = cardValues['speedText'];
     let attackText = document.createElement("h4");
     attackText.innerText = cardValues['attackText'];
     let dodgeText = document.createElement("h4");
     dodgeText.innerText = cardValues['dodgeText'];
     dodgeText.classList.add("outOfBattleElem");
     let armorText = document.createElement("h4");
     armorText.innerText = cardValues['armorText'];
     //Replace the form elements with text
     card.replaceChild(nameText, card.children[0]);
     card.replaceChild(healthText, card.children[2]);
     card.replaceChild(speedText, card.children[4]);
     card.replaceChild(attackText, card.children[6]);
     card.replaceChild(dodgeText, card.children[8]);
     card.replaceChild(armorText, card.children[10]);
 }

export {editCard, saveCard, cancelEdit, createCardTemplate};
