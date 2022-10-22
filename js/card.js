import {newSystemCall} from "./action.js";
import {expRequired} from "./level.js";

/**
 * This function generates an enemy to be inserted into the list
 *
 * @generator
 * @function generateNewEnemy
 * @yields {Participant} The {@link Participant} generated
 */
function generateNewEnemy(){
    let enemy = {
        name: "Przeciwnik",
        maxHealth: 100,
        isDodging: 0,
        type: "enemy",
        subtype: Math.random() < 0.5 ? "human" : "monster"
    };

    for (let enemyStat of Object.keys(enemyStatLimits)) {
        enemy[enemyStat] = getRndInteger(enemyStatLimits[enemyStat].min, enemyStatLimits[enemyStat].max);
    }

    if(enemy.subtype === "human") enemy.itemsOwned = generateRandomItems();

    return enemy;
}

/**
 * This function displays participant cards to pick from
 *
 * @generator
 * @function displayCardPicker
 */
function displayCardPicker(type) {
    let list = (type === "player" ? availablePlayers : availableEnemies);

    let selectSection = document.createElement('section');
    let pickingOverlay = document.getElementById("pickingOverlay");

    for (var i = 0; i < list.length; i++) {
        let option = createCardTemplate(type, list[i]);
        option.classList.add("clickOnMe");
        let index = i;

        // TODO: remove btn

        option.addEventListener("click", function() {
            if(type === "player") {
                if(addPlayer(index)) {
                    pickingOverlay.classList.add("hidden");
                    pickingOverlay.removeChild(pickingOverlay.firstChild);
                }
            }
            else if (type === "enemy") {
                addEnemy(index);
                pickingOverlay.classList.add("hidden");
                pickingOverlay.removeChild(pickingOverlay.firstChild);
            }
         }, false);

        selectSection.appendChild(option);
    }

    pickingOverlay.appendChild(selectSection);
    pickingOverlay.classList.remove("hidden");
}

/**
 * This function adds a player card
 *
 * @generator
 * @function addPlayer
 * @yields {Element} a valid participant card <section> element
 */
function addPlayer(index) {
    if(availablePlayers[index].inUse){
        newSystemCall("Wybrany gracz jest już w grze");
        return false;
    }
    availablePlayers[index].inUse = true;
    createCard("player", structuredClone(availablePlayers[index]));
    return true;
}

/**
 * This function adds an enemy card
 *
 * @generator
 * @function addEnemy
 * @yields {Element} a valid participant card <section> element
 */
 function addEnemy(index) {
    enemyCount++;
    let newEnemy = structuredClone(availableEnemies[index]);
    newEnemy.name +=  " " + enemyCount;
    createCard("enemy", newEnemy);
}


/**
 * This function constructs a participant card template
 *
 * @generator
 * @function createCardTemplate
 * @returns {Element} a valid participant card template <section> element
 */
 function createCardTemplate(type, newParticipant){
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
    dodgeValue.innerText = newParticipant.dodge;
    dodgeLabel.classList.add("experienceLabel");
    dodgeValue.classList.add("experienceLabel");
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

        lvlLabel.classList.add("experienceLabel");
        lvlValue.classList.add("experienceValue");
        experienceLabel.classList.add("experienceLabel");
        experienceValue.classList.add("experienceValue");

        lvlLabel.innerText = "Level:";
        lvlValue.innerText = newParticipant.level;
        experienceLabel.innerText = "Doświadczenie:";
        experienceValue.innerText = newParticipant.experience + " / " + expRequired(newParticipant.level);

        card.appendChild(lvlLabel);
        card.appendChild(lvlValue);
        card.appendChild(experienceLabel);
        card.appendChild(experienceValue);
    }else if(type === "enemy"){
        //add enemy-only elements (zone)
        let zoneLabel = document.createElement("label");
        let zoneValue = document.createElement("h4");

        zoneLabel.classList.add("experienceLabel");
        zoneValue.classList.add("experienceValue");

        zoneLabel.innerText = "Strefa:";
        zoneValue.innerText = newParticipant.zone;

        card.appendChild(zoneLabel);
        card.appendChild(zoneValue);
    }

    return card;
}


/**
 * This function starts the adding process of a participant card into the document
 *
 * @generator
 * @function addCard
 */function addCard(type){

     //add a new participant into the array
     if(type === "player"){
         if(playerCount === 4) {
            newSystemCall("Nie udało się dodać nowego gracza ponieważ limit to 4");
            return;
         }

         playerCount++;
     } else if(type === "enemy"){
         if(enemyCount === 9) {
             newSystemCall("Nie udało się dodać nowego przeciwnika ponieważ limit to 9");
             return;
         }
     }

     displayCardPicker(type);
 }

/**
 * This function constructs a participant card and adds it to the proper slot
 *
 * @generator
 * @function createCard
 * @yields {Element} a valid participant card <section> element
 */function createCard(type, newParticipant)
 {
     participantsDefinition = participantsDefinition.concat(newParticipant);

     let card = createCardTemplate(type, newParticipant);
     card.id = "participant-" + (participantsDefinition.length-1);

     let editButton = document.createElement("button");
     let saveButton = document.createElement("button");
     let cancelButton = document.createElement("button");
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

     //append the edition buttons at the end
     card.appendChild(editButton);
     card.appendChild(saveButton);
     card.appendChild(cancelButton);

     //append the card to the right side of the board
     if(type === "player"){
         document.getElementById("playerSlots").appendChild(card);
     }else if(type === "enemy"){
         document.getElementById("enemySlots").appendChild(card);
     }
 }

 /**
  * This function deleted an existing participant's card
  *
  * @function delCard
  * @param {string} type - The type of participant (player/enemy)
  * @return {void}
  */
 function delCard(type)
 {
     if(type === "player"){
         if(playerCount === 1) {
             newSystemCall("Nie udało się usunąć gracza, w walce musi brać udział minimum 1");
             return;
         }
         //remove the participant card
         let section = document.getElementById("playerSlots");
         section.removeChild(section.lastChild);
         //remove the participant from the array
         let removedPlayer = participantsDefinition.splice(participantsDefinition.indexOf(participantsDefinition.filter(p => p.type === "player").pop()), 1)[0];
         availablePlayers.filter(p => p.UID === removedPlayer.UID)[0].inUse = false;
         playerCount--;
     }else if(type === "enemy"){
         if(enemyCount === 1) {
             newSystemCall("Nie udało się usunąć przeciwnika, w walce musi brać udział minimum 1");
             return;
         }
         //remove the participant card
         let section = document.getElementById("enemySlots");
         section.removeChild(section.lastChild);
         //remove the participant from the array
         participantsDefinition.splice(participantsDefinition.indexOf(participantsDefinition.filter(p => p.type === "enemy").pop()), 1);
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
     //players and enemies have different button placement
     let buttonsStartHere = cType === "enemy" ? 13 : 15;
     //hide the edit button
     card.children[buttonsStartHere].classList.toggle("hidden");
     //enable the save and cancel buttons
     card.children[buttonsStartHere+1].classList.toggle("hidden");
     card.children[buttonsStartHere+2].classList.toggle("hidden");
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
     dodgeText.classList.add("experienceLabel");
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
     //update the details in the participants array
     participantsDefinition[pId].maxHealth = newHealth;
     participantsDefinition[pId].speed = newSpeed;
     participantsDefinition[pId].atk = newAttack;
     participantsDefinition[pId].dodge = newDodge;
     participantsDefinition[pId].armor = newArmor;
     //players and enemies may have dedicated elements only they can access
     if(cType === "enemy"){
         let newZone = card.children[12].value;
         let zoneText = document.createElement("h4");
         zoneText.innerText = newZone;
         card.replaceChild(zoneText, card.children[12]);
         participantsDefinition[pId].zone = newZone;
     }
     //players and enemies have different button placement
     let buttonsStartHere = cType === "enemy" ? 13 : 15;
     //hide the edit button
     card.children[buttonsStartHere].classList.toggle("hidden");
     //enable the save and cancel buttons
     card.children[buttonsStartHere+1].classList.toggle("hidden");
     card.children[buttonsStartHere+2].classList.toggle("hidden");
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
         card.replaceChild(zoneText, card.children[12]);
     }
     //players and enemies have different button placement
     let buttonsStartHere = cType === "enemy" ? 13 : 15;
     //hide the edit button
     card.children[buttonsStartHere].classList.toggle("hidden");
     //enable the save and cancel buttons
     card.children[buttonsStartHere+1].classList.toggle("hidden");
     card.children[buttonsStartHere+2].classList.toggle("hidden");
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
            //xp is updated in the definition so it has to be fetched from the definition too
            battleSlot.children[12].innerText = arrOfChoice[i].level;
            battleSlot.children[14].innerText = arrOfChoice[i].experience + " / " + expRequired(arrOfChoice[i].level);
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
        'life_flask': 0,
        'small_life_potion': 0,
        'life_potion': 0,
        'large_life_potion': 0,
        'regeneration_flask': 0
    };

    //choose two healing items and one reviving item
    let first_healing = randomOfTwo('life_flask', 'small_life_potion');
    let second_healing = randomOfTwo('large_life_potion', 'life_potion');
    let first_reviving = 'regeneration_flask';

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

export {addCard, delCard, editCard, saveCard, cancelEdit, refreshCardsInBattle, generateRandomItems, generateNewEnemy};
