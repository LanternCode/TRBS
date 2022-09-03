/**
 * pre-defined players array
 *
 * @type {[{isDodging: number, dodge: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number}]}*/
const players = [
    {
        name: 'Karim',
        maxHealth: 100,
        health: 100,
        speed: 81,
        atk: 200,
        dodge: 11,
        experience: 0,
        isDodging: 0,
        type: "player",
        itemsOwned: {
            'life_flask': 1,
            'small_life_potion': 0,
            'life_potion': 1,
            'large_life_potion': 0,
            'regeneration_flask': 0
        }
    },
    {
        name: 'Antonio',
        maxHealth: 80,
        health: 80,
        speed: 82,
        atk: 15,
        dodge: 9,
        experience: 0,
        isDodging: 0,
        type: "player",
        itemsOwned: {
            'life_flask': 0,
            'small_life_potion': 1,
            'life_potion': 0,
            'large_life_potion': 1,
            'regeneration_flask': 0
        }
    },
    {
        name: 'Dion',
        maxHealth: 90,
        health: 90,
        speed: 17,
        atk: 10,
        dodge: 6,
        experience: 0,
        isDodging: 0,
        type: "player",
        itemsOwned: {
            'life_flask': 0,
            'small_life_potion': 0,
            'life_potion': 0,
            'large_life_potion': 0,
            'regeneration_flask': 1
        }
    },
    {
        name: 'Astrid',
        maxHealth: 80,
        health: 80,
        speed: 17,
        atk: 10,
        dodge: 6,
        experience: 0,
        isDodging: 0,
        type: "player",
        itemsOwned: {
            'life_flask': 0,
            'small_life_potion': 0,
            'life_potion': 0,
            'large_life_potion': 0,
            'regeneration_flask': 10
        }
    }];

/**
 * A Participant
 * @typedef {Object} Participant
 * @property {string} name - Participant's name
 * @property {number} maxHealth - Participant's endurance
 * @property {number} health - Participant's current hp (for use in battles)
 * @property {number} speed - Participant's speed
 * @property {number} atk - Participant's attack
 * @property {number} dodge - Participant's dodge
 * @property {boolean} isDodging - Participant dodge action on or off
 * @property {string} type - Participant type (enemy/player)
 * @property {number} [experience] - Participant's xp count, only for players
 * @property {Object} [itemsOwned] - Participant's items, only for players
 */

/**
 * An Item
 * @typedef {Object} Item
 * @property {string} name - Item id
 * @property {string} displayName - Item display name
 * @property {string} type - Item type (for now only healing)
 * @property {string} valueType - Item value type (flat or percentage)
 * @property {number} value - Item value (flat number or decimal percentage)
 */

/**
 * An object of objects with min and max values for participant generation
 *
 * @type {{dodge: {min: number, max: number}, health: {min: number, max: number}, atk: {min: number, max: number}, speed: {min: number, max: number}}}
 */
const enemyStatLimits = {
    health: {
        min: 50,
        max: 100
    },
    speed: {
        min: 1,
        max: 100
    },
    atk: {
        min: 9,
        max: 22
    },
    dodge: {
        min: 6,
        max: 11
    }
}

/**
 * pre-defined item definition array
 *
 * @type {[{displayName: string, valueType: string, name: string, type: string, value: number},{displayName: string, valueType: string, name: string, type: string, value: number},{displayName: string, valueType: string, name: string, type: string, value: number},{displayName: string, valueType: string, name: string, type: string, value: number},{displayName: string, valueType: string, name: string, type: string, value: number}]}
 */
const items = [
    {
        name: "life_flask",
        displayName: "Flakon Życia",
        type: "healing",
        valueType: "flat",
        value: 10
    },
    {
        name: "small_life_potion",
        displayName: "Mała Mikstura Życia",
        type: "healing",
        valueType: "flat",
        value: 15
    },
    {
        name: "life_potion",
        displayName: "Mikstura Życia",
        type: "healing",
        valueType: "flat",
        value: 22
    },
    {
        name: "large_life_potion",
        displayName: "Większa Mikstura Życia",
        type: "healing",
        valueType: "flat",
        value: 30
    },
    {
        name: "regeneration_flask",
        displayName: "Flakon Regeneracji",
        type: "healing",
        valueType: "parcentage",
        value: 0.50
    }
];

/**
 * Pre-defined, empty participants array
 * @type {*[]}
 */
let participants = [];

/**
 * Pre-defined player counter
 * @type {number}
 */
let playerCount = 0;
/**
 * Pre-defined enemy counter
 * @type {number}
 */
let enemyCount = 0;

/**
 * Pre-defined global turn counter
 * @type {number}
 */
let globalTurn = 1;
/**
 * Pre-defined local turn counter
 * @type {number}
 */
let localTurn = 0;

/**
 * Pre-defined priority 2 flag
 * @type {boolean}
 */
let priorityTwo = true;
/**
 * Pre-defined priority 3 flag
 * @type {boolean}
 */
let priorityThree = true;

/**
 * This function generates a random integer in the given range, inclusive.
 *
 * @generator
 * @function getRndInteger
 * @param {number} min - The beginning of the range
 * @param {number} max - The end of the range
 * @return {number} The number generated
 */
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (++max-min)) + min; // + 1 for max to be included
}

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
 */
function addCard(type)
{
    //add a new participant into the array
    if(type === "player"){
        if(playerCount === 4) return;
        participants = participants.concat(structuredClone(players[playerCount]));
        playerCount++;
    }else if(type === "enemy"){
        if(enemyCount === 9) return;
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
    editButton.onclick = function(){
        editCard(this);
    };
    saveButton.innerText = "Zapisz";
    saveButton.classList = "hidden";
    saveButton.onclick = function(){
        saveCard(this);
    };
    cancelButton.innerText = "Cofnij";
    cancelButton.classList = "hidden";
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
        experienceValue.innerText = participants[participants.length-1].experience;
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
        if(playerCount === 1) return;
        //remove the participant card
        let section = document.getElementById("playerSlots");
        section.removeChild(section.lastChild);
        //remove the participant from the array
        participants.splice(participants.indexOf(participants.filter(p => p.type === "player").pop()), 1);
        playerCount--;
    }else if(type === "enemy"){
        if(enemyCount === 1) return;
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
    //hide the edit button
    card.children[11].classList.toggle("hidden");
    //enable the save and cancel buttons
    card.children[12].classList.toggle("hidden");
    card.children[13].classList.toggle("hidden");
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
    //show the edit button
    card.children[11].classList.toggle("hidden");
    //hide the save and cancel buttons
    card.children[12].classList.toggle("hidden");
    card.children[13].classList.toggle("hidden");
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
    //show the edit button
    card.children[11].classList.toggle("hidden");
    //hide the save and cancel buttons
    card.children[12].classList.toggle("hidden");
    card.children[13].classList.toggle("hidden");
}

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

    if(participantsOK)
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
        for (let elem of document.getElementsByClassName("AddCardButton"))
            elem.classList.toggle("hidden");

        //enable the act button
        document.getElementById("actButton").classList.toggle("hidden");

        //hide experience
        for (let elem of document.getElementsByClassName("experienceValue"))
            elem.classList.toggle("hidden");
        for (let elem of document.getElementsByClassName("experienceLabel"))
            elem.classList.toggle("hidden");

        //sort the array by speed to establish turn order
        participants.sort((a, b) => b.speed - a.speed);

        //Update the battle state description
        document.getElementById("battleStatus").innerText = "W trakcie!";

        //Hide the start battle button and show the next turn button
        document.getElementById("startBattleButton").classList.toggle("hidden");
        document.getElementById("nextTurnButton").classList.toggle("hidden");

        //Update the "acts now" label
        document.getElementById("nowActsDesc").innerText = participants[0].name;

        //Prepare the targets list
        let targetSlot = document.getElementById("targetsList");
        //Reset the list if the battle resets
        targetSlot.innerHTML = '';
        for(let i = 0; i < participants.length; ++i)
        {
            //construct the option and insert it into the list
            let opt = document.createElement('option');
            opt.value = i;
            opt.innerText = participants[i].name;
            targetSlot.appendChild(opt);
            //reset participant's hp to its max value (for battle resets)
            participants[i].health = participants[i].maxHealth;
        }

        refreshBattleSlots();
    }
    else {
        //show a message on screen saying you need to add more fighters
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
        //update the display properties
        battleSlot.children[0].innerText = participants[i].name;
        battleSlot.children[2].innerText = participants[i].health;
        battleSlot.children[4].innerText = participants[i].speed;
        battleSlot.children[6].innerText = participants[i].atk;
        battleSlot.children[8].innerText = participants[i].dodge;
        battleSlot.children[10].innerText = participants[i].experience;
    }
}

/**
 * This function handles user actions
 *
 * @function act
 * @return {void}
 */
function act()
{
    let action = document.getElementById("action").value;
    let target = document.getElementById("targetsList").value;
    let item_key = document.getElementById("itemsList").value;
    let priorityTwoActionFlag = document.getElementById("priorityTwoActionFlag");
    let priorityThreeActionFlag = document.getElementById("priorityThreeActionFlag");

    switch(action)
    {
        case "attack":
        {
            if(priorityTwo === true)
            {
                let attack = participants[localTurn].atk;
                if(participants[target].isDodging)
                {
                    //target is dodging - in phase 2 avoid half the damage
                    attack = Math.floor(attack / 2);
                }

                // phase 2:
                let dodgingCheck = Math.floor(Math.random() * 20) + 1;

                if(dodgingCheck < participants[target].dodge)
                {
                    //target is dodging
                    attack = 0;
                    document.getElementById("systemThrow").innerText = dodgingCheck + " (unik)";
                }
                else if(dodgingCheck === participants[target].dodge)
                {
                    //target is taking half of the damage
                    attack = Math.floor(attack / 2);
                    document.getElementById("systemThrow").innerText = dodgingCheck + " (połowiczny unik)";
                }
                else
                {
                    //target is taking the whole damage
                    document.getElementById("systemThrow").innerText = dodgingCheck + " (trafienie)";
                }

                let targetHealth = participants[target].health;
                if(targetHealth - attack > 0)
                    participants[target].health -= attack;
                else participants[target].health = 0;

                priorityTwo = false;
            }
            else
            {
                //no actions left
            }
            break;
        }
        case "dodge":
        {
            if(priorityTwo === true)
            {
                participants[localTurn].isDodging = 1;
                priorityTwo = false;
            }
            else
            {
                //no actions left
            }
            break;
        }
        case "item":
        {
            if(priorityThree === true)
            {
                //find the item in the item list
                let item = items.find(i => i.name === item_key);
                //use the item
                if(item.valueType === "flat"){
                    if(participants[target].health + item.value > participants[target].maxHealth)
                        participants[target].health = participants[target].maxHealth;
                    else participants[target].health += item.value;
                }
                else{
                    if(participants[target].health + (participants[target].maxHealth * item.value) > participants[target].maxHealth)
                        participants[target].health = participants[target].maxHealth;
                    else participants[target].health += (participants[target].maxHealth * item.value);
                }
                //reduce player's item count
                participants[localTurn].itemsOwned[item_key] -= 1;
                priorityThree = false;
            }
            else
            {
                //no actions left
            }
        }
        default:
        {
            break;
        }
    }

    // mark unavailable actions
    if(priorityTwo === false)
    {
        priorityTwoActionFlag.classList.add("disabled");
    }
    if(priorityThree === false)
    {
        priorityThreeActionFlag.classList.add("disabled");
    }

    //check if the battle is over
    isBattleOver();

    //refresh cards to reflect the action
    refreshBattleSlots();
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
    for (let elem of document.getElementsByClassName("AddCardButton"))
        elem.classList.toggle("hidden");

    if(identifier === "e"){
        for (let player of participants.filter(participant => participant.type === "player")) {
            if(player.health > 0){
                player.experience++;
            }
        }
    }

    //display experience labels
    for (let elem of document.getElementsByClassName("experienceValue"))
        elem.classList.toggle("hidden");
    for (let elem of document.getElementsByClassName("experienceLabel"))
        elem.classList.toggle("hidden");
}

/**
 * This function checks if the battle has ended or not
 *
 * @function isBattleOver
 * @return {void} calls {@link endBattle} if the condition is met
 */
function isBattleOver()
{
    //check if all enemies or all players are down
    let playersDown = participants.filter(participant => participant.type === "player").every(p => p.health === 0);
    let enemiesDown = participants.filter(participant => participant.type === "enemy").every(p => p.health === 0);

    if(playersDown) endBattle("p");
    else if(enemiesDown) endBattle("e");
}

/**
 * This function updates the item list to these owned by a participant at the start of their turn
 *
 * @function updateItemList
 * @return {void}
 */
function updateItemList()
{
    //remove all children
    let itemSlots = document.getElementById("itemsList");
    itemSlots.innerHTML = '';
    //insert new elements
    if(participants[localTurn].itemsOwned === null || typeof participants[localTurn].itemsOwned === 'undefined')
    {
        //items are not defined/available
    }
    else
    {
        for (let itanz of Object.entries(participants[localTurn].itemsOwned))
        {
            let item_name = itanz[0];
            let item_count = itanz[1];
            //find the item in the item list to get its name
            let item = items.find(i => i.name === item_name);
            if(item_count > 0) {
                let opt = document.createElement('option');
                opt.value = item_name;
                opt.innerText = item.displayName + ": " + item_count;
                itemSlots.appendChild(opt);
            }
        }
    }
}

/**
 * This function ends the current local/global turn
 *
 * @function nextTurn
 * @return {void}
 */
function nextTurn()
{
    //reset the available action flags
    priorityTwo = true;
    priorityThree = true;
    let priorityTwoActionFlag = document.getElementById("priorityTwoActionFlag");
    let priorityThreeActionFlag = document.getElementById("priorityThreeActionFlag");
    priorityTwoActionFlag.classList.remove("disabled");
    priorityThreeActionFlag.classList.remove("disabled");

    // reset system throw display
    document.getElementById("systemThrow").innerText = "";

    //update the local turn counter
    localTurn++;

    //check if this was the last local turn of the global turn
    if(localTurn === participants.length)
    {
        localTurn = 0;
        globalTurn++;
        document.getElementById("globalTurn").innerText = globalTurn;
    }

    //if the member was dodging, disable their dodge once their turn starts again
    participants[localTurn].isDodging = 0;

    //Update the "acts now" label
    document.getElementById("nowActsDesc").innerText = participants[localTurn].name;

    //check if the battle is over
    isBattleOver();

    //Check if the participant is alive, if not, start next turn
    if(participants[localTurn].health === 0) nextTurn();

    //update the available items list
    updateItemList();
}
