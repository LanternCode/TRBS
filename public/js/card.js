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

    //add the attributes to the card
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
    card.appendChild(statusLabel);
    card.appendChild(statusValue);

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
     let arrayOfChoice = location === "table" ? Settings.participantsDefinition : (type === "player" ? Settings.availablePlayers : Settings.availableEnemies);
     if(location === "list") {
         dropParticipant(arrayOfChoice[pId], type);
         arrayOfChoice.splice(pId, 1);
     }
     else if(type === "player")
     {
         let pName = card.children[0].textContent.split('[')[0].trim();
         let removedPlayer = arrayOfChoice.splice(arrayOfChoice.indexOf(arrayOfChoice.filter(p => p.type === "player" && p.name === pName).pop()), 1)[0];
         //if they're a player - also update their inUse property
         if(location === "table") {
             Settings.availablePlayers.filter(p => p._id === removedPlayer._id)[0].inUse = false;
             Settings.playerCount--;
         }
     }
     else {
         let pName = card.children[0].textContent.split('[')[0].trim();
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
     //get the card element
     let card = e.parentNode;
     //get the card type
     let cType = card.classList.contains("enemySection") ? "enemy" : "player";
     //get the location
     let cLoc = card.classList.contains("clickOnMe") ? "list" : "table";
     //construct editable elements
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
     //replace the text elements with text forms to allow editing
     card.replaceChild(nameInput, card.children[0]);
     card.replaceChild(healthInput, card.children[2]);
     card.replaceChild(speedInput, card.children[4]);
     card.replaceChild(attackInput, card.children[6]);
     card.replaceChild(dodgeInput, card.children[8]);
     card.replaceChild(armorInput, card.children[10]);
     //players and enemies may have dedicated elements only they can access
     if(cType === "enemy"){
         let zoneInput = document.createElement("input");
         zoneInput.type = "text";
         zoneInput.value = card.children[14].innerText;
         zoneInput.dataset.originalValue = card.children[14].innerText;
         card.replaceChild(zoneInput, card.children[14]);
     }
     else {
         card.children[14].classList.add("hidden");
         card.children[16].classList.add("hidden");
     }
     //players and enemies have different button placement
     let buttonsStartHere = cType === "enemy" ? 15 : 19;
     //hide the edit and pick buttons
     card.children[buttonsStartHere].classList.add("hidden");
     //enable the save, cancel and drop buttons
     card.children[buttonsStartHere+1].classList.remove("hidden");
     card.children[buttonsStartHere+2].classList.remove("hidden");
     card.children[buttonsStartHere+3].classList.remove("hidden");
     if(cLoc === "list") {
         card.children[buttonsStartHere+4].classList.add("hidden");
     }
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
     let newName = card.children[0].value;
     let newHealth = card.children[2].value;
     let newSpeed = card.children[4].value;
     let newAttack = card.children[6].value;
     let newDodge = card.children[8].value;
     let newArmor = card.children[10].value;
     let newNameWithDodge = newName + " [" + newDodge + "]";
     //construct text elements
     let nameText = document.createElement("h3");
     nameText.innerText = newNameWithDodge;
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
     let arrayOfChoice = cLoc === "list" ? (cType === "player" ? Settings.availablePlayers : Settings.availableEnemies) : Settings.participantsDefinition;
     //update the details in the participants array
     arrayOfChoice[pId].name = newName;
     arrayOfChoice[pId].maxHealth = parseInt(newHealth);
     arrayOfChoice[pId].health = parseInt(newHealth);
     arrayOfChoice[pId].speed = parseInt(newSpeed);
     arrayOfChoice[pId].attack = parseInt(newAttack);
     arrayOfChoice[pId].dodge = parseInt(newDodge);
     arrayOfChoice[pId].armor = parseInt(newArmor);
     //players and enemies may have dedicated elements only they can access
     if(cType === "enemy"){
         let newZone = card.children[14].value;
         let zoneText = document.createElement("h4");
         zoneText.innerText = newZone;
         zoneText.classList.add("outOfBattleElem");
         card.replaceChild(zoneText, card.children[14]);
         arrayOfChoice[pId].zone = newZone;
     }
     else {
         card.children[14].classList.remove("hidden");
         card.children[16].classList.remove("hidden");
     }
     //players and enemies have different button placement
     let buttonsStartHere = cType === "enemy" ? 15 : 19;
     //enable the edit and pick buttons
     card.children[buttonsStartHere].classList.remove("hidden");
     //hide the save, cancel and drop buttons
     card.children[buttonsStartHere+1].classList.add("hidden");
     card.children[buttonsStartHere+2].classList.add("hidden");
     card.children[buttonsStartHere+3].classList.add("hidden");
     if(cLoc === "list") {
        updateParticipant(arrayOfChoice[pId], cType);
        card.children[buttonsStartHere+4].classList.remove("hidden");
     }
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
     //get the location
     let cLoc = card.classList.contains("clickOnMe") ? "list" : "table";
     //construct text elements
     let nameText = document.createElement("h4");
     nameText.innerText = card.children[0].dataset.originalValue + " [" + card.children[8].dataset.originalValue + "]";
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
     card.replaceChild(nameText, card.children[0]);
     card.replaceChild(healthText, card.children[2]);
     card.replaceChild(speedText, card.children[4]);
     card.replaceChild(attackText, card.children[6]);
     card.replaceChild(dodgeText, card.children[8]);
     card.replaceChild(armorText, card.children[10]);
     //players and enemies may have dedicated elements only they can access
     if(cType === "enemy"){
         let zoneText = document.createElement("h4");
         zoneText.innerText = card.children[14].dataset.originalValue;
         zoneText.classList.add("outOfBattleElem");
         card.replaceChild(zoneText, card.children[14]);
     }
     else {
         card.children[14].classList.remove("hidden");
         card.children[16].classList.remove("hidden");
     }
     //players and enemies have different button placement
     let buttonsStartHere = cType === "enemy" ? 15 : 19;
     //enable the edit and pick buttons
     card.children[buttonsStartHere].classList.remove("hidden");
     //hide the save, cancel and drop buttons
     card.children[buttonsStartHere+1].classList.add("hidden");
     card.children[buttonsStartHere+2].classList.add("hidden");
     card.children[buttonsStartHere+3].classList.add("hidden");
     if(cLoc === "list") {
         card.children[buttonsStartHere+4].classList.remove("hidden");
     }
 }

export {editCard, saveCard, cancelEdit, createCardTemplate};
