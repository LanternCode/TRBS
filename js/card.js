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
    enemyCount++;
    let enemy = {
        name: "Przeciwnik " + enemyCount,
        maxHealth: 100,
        isDodging: 0,
        type: "enemy"
    };

    for (let enemyStat of Object.keys(enemyStatLimits)) {
        enemy[enemyStat] = getRndInteger(enemyStatLimits[enemyStat].min, enemyStatLimits[enemyStat].max);
    }

    return enemy;
}

/**
 * This function constructs a participant card and adds it into the document
 *
 * @generator
 * @function addCard
 * @yields {Element} a valid participant card <section> element
 */function addCard(type)
 {
     //add a new participant into the array
     if(type === "player"){
         if(playerCount === 4) {
            newSystemCall("Nie udało się dodać nowego gracza ponieważ limit to 4");
            return;
         }
         participants = participants.concat(structuredClone(players[playerCount]));
         playerCount++;
     }else if(type === "enemy"){
         if(enemyCount === 9) {
             newSystemCall("Nie udało się dodać nowego przeciwnika ponieważ limit to 9");
             return;
         }
         participants = participants.concat(generateNewEnemy());
     }

     //Construct the card
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
     let editButton = document.createElement("button");
     let saveButton = document.createElement("button");
     let cancelButton = document.createElement("button");

     //add the attributes to the card
     card.id = "participant-" + (participants.length-1);
     card.className = type === "player" ? "playerSection" : "enemySection";
     participantName.innerText = participants[participants.length-1].name;
     healthLabel.innerText = "HP:";
     healthValue.innerText = participants[participants.length-1].health;
     speedLabel.innerText = "Szybkość:";
     speedValue.innerText = participants[participants.length-1].speed;
     attackLabel.innerText = "Atak:";
     attackValue.innerText = participants[participants.length-1].atk;
     dodgeLabel.innerText = "Unik:";
     dodgeValue.innerText = participants[participants.length-1].dodge;
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

     // set experience labels
     if(type === "player"){
         let experienceLabel = document.createElement("label");
         let experienceValue = document.createElement("h4");

         experienceLabel.classList.add("experienceLabel");
         experienceValue.classList.add("experienceValue");

         experienceLabel.innerText = "Doświadczenie:";
         experienceValue.innerText = participants[participants.length-1].experience + " / " + expRequired(participants[participants.length-1].level);
         card.appendChild(experienceLabel);
         card.appendChild(experienceValue);
     }

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
         participants.splice(participants.indexOf(participants.filter(p => p.type === "player").pop()), 1);
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
         participants.splice(participants.indexOf(participants.filter(p => p.type === "enemy").pop()), 1);
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
     console.log(card);
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
     //replace the text elements with text forms to allow editing
     card.replaceChild(healthInput, card.children[2]);
     card.replaceChild(speedInput, card.children[4]);
     card.replaceChild(attackInput, card.children[6]);
     card.replaceChild(dodgeInput, card.children[8]);
     //players and enemies have different button placement
     let buttonsStartHere = card.classList.contains("enemySection") ? 9 : 11;
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
     console.log(e.parentNode);
     //get the card element
     let card = e.parentNode;
     //get the new values
     let newHealth = card.children[2].value;
     let newSpeed = card.children[4].value;
     let newAttack = card.children[6].value;
     let newDodge = card.children[8].value;
     //construct text elements
     let healthText = document.createElement("h4");
     healthText.innerText = newHealth;
     let speedText = document.createElement("h4");
     speedText.innerText = newSpeed;
     let attackText = document.createElement("h4");
     attackText.innerText = newAttack;
     let dodgeText = document.createElement("h4");
     dodgeText.innerText = newDodge;
     //replace the form elements with text
     card.replaceChild(healthText, card.children[2]);
     card.replaceChild(speedText, card.children[4]);
     card.replaceChild(attackText, card.children[6]);
     card.replaceChild(dodgeText, card.children[8]);
     //get the participant id
     let pId = card.id.split('-')[1];
     //update the details in the participants array
     participants[pId].maxHealth = newHealth;
     participants[pId].speed = newSpeed;
     participants[pId].atk = newAttack;
     participants[pId].dodge = newDodge;
     //players and enemies have different button placement
     let buttonsStartHere = card.classList.contains("enemySection") ? 9 : 11;
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
     //construct text elements
     let healthText = document.createElement("h4");
     healthText.innerText = card.children[2].dataset.originalValue;
     let speedText = document.createElement("h4");
     speedText.innerText = card.children[4].dataset.originalValue;
     let attackText = document.createElement("h4");
     attackText.innerText = card.children[6].dataset.originalValue;
     let dodgeText = document.createElement("h4");
     dodgeText.innerText = card.children[8].dataset.originalValue;
     //replace the form elements with text
     card.replaceChild(healthText, card.children[2]);
     card.replaceChild(speedText, card.children[4]);
     card.replaceChild(attackText, card.children[6]);
     card.replaceChild(dodgeText, card.children[8]);
     //players and enemies have different button placement
     let buttonsStartHere = card.classList.contains("enemySection") ? 9 : 11;
     //hide the edit button
     card.children[buttonsStartHere].classList.toggle("hidden");
     //enable the save and cancel buttons
     card.children[buttonsStartHere+1].classList.toggle("hidden");
     card.children[buttonsStartHere+2].classList.toggle("hidden");
 }

export {addCard, delCard, editCard, saveCard, cancelEdit};
