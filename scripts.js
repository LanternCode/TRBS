//pre-defined players array
const players = [
    {
        name: 'Karim',
        health: 100,
        speed: 81,
        atk: 200,
        dodge: 11,
        uuid: 0,
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
        health: 80,
        speed: 82,
        atk: 15,
        dodge: 9,
        uuid: 0,
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
        health: 90,
        speed: 17,
        atk: 10,
        dodge: 6,
        uuid: 0,
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
        health: 80,
        speed: 17,
        atk: 10,
        dodge: 6,
        uuid: 0,
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

//pre-defined enemies array
const enemies = [
    {
        name: 'Przeciwnik 1',
        health: 100,
        speed: 88,
        atk: 200,
        dodge: 9,
        uuid: 0,
        isDodging: 0,
        type: "enemy"
    },
    {
        name: 'Przeciwnik 2',
        health: 100,
        speed: 12,
        atk: 20,
        dodge: 6,
        uuid: 0,
        isDodging: 0,
        type: "enemy"
    },
    {
        name: 'Przeciwnik 3',
        health: 100,
        speed: 36,
        atk: 20,
        dodge: 7,
        uuid: 0,
        isDodging: 0,
        type: "enemy"
    },
    {
        name: 'Przeciwnik 4',
        health: 100,
        speed: 36,
        atk: 20,
        dodge: 7,
        uuid: 0,
        isDodging: 0,
        type: "enemy"
    },
    {
        name: 'Przeciwnik 5',
        health: 100,
        speed: 36,
        atk: 20,
        dodge: 7,
        uuid: 0,
        isDodging: 0,
        type: "enemy"
    },
    {
        name: 'Przeciwnik 6',
        health: 100,
        speed: 36,
        atk: 20,
        dodge: 7,
        uuid: 0,
        isDodging: 0,
        type: "enemy"
    },
    {
        name: 'Przeciwnik 7',
        health: 100,
        speed: 36,
        atk: 20,
        dodge: 7,
        uuid: 0,
        isDodging: 0,
        type: "enemy"
    },
    {
        name: 'Przeciwnik 8',
        health: 100,
        speed: 36,
        atk: 20,
        dodge: 7,
        uuid: 0,
        isDodging: 0,
        type: "enemy"
    },
    {
        name: 'Przeciwnik 9',
        health: 100,
        speed: 36,
        atk: 20,
        dodge: 7,
        uuid: 0,
        isDodging: 0,
        type: "enemy"
    }];

//pre-defined item definition array
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
        value: 1.50
    }
];
//pre-defined, empty participants array
let participants = [];
let playerCount = 0;
let enemyCount = 0;

//pre-defined counters
let globalTurn = 1;
let localTurn = 0;

//pre-defined flags
let priorityTwo = true;
let priorityThree = true;

function addCard(type)
{
    //add a new participant into the array
    if(type === "player"){
        if(playerCount === 4) return;
        participants = participants.concat(structuredClone(players[playerCount]));
        playerCount++;
    }else if(type === "enemy"){
        if(enemyCount === 9) return;
        participants = participants.concat(structuredClone(enemies[enemyCount]));
        enemyCount++;
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

    //append the card to the right side of the board
    if(type === "player"){
        document.getElementById("playerSlots").appendChild(card);
    }else if(type === "enemy"){
        document.getElementById("enemySlots").appendChild(card);
    }
}

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

function startBattle()
{
    //Check if there is enough players and enemies to start the battle
    let participantsOK = playerCount > 0 && enemyCount > 0;

    if(participantsOK)
    {
        //reset the turn counters
        localTurn = 0;
        globalTurn = 1;

        //disable the buttons that add new participants
        for (let elem of document.getElementsByClassName("AddCardButton"))
            elem.classList.toggle("hidden");

        //enable the act button
        document.getElementById("actButton").classList.toggle("hidden");

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
        for(let i = 0; i < participants.length; ++i)
        {
            let opt = document.createElement('option');
            opt.value = i;
            opt.innerText = participants[i].name;
            targetSlot.appendChild(opt);
        }

        refreshBattleSlots();
    }
    else {
        //show a message on screen saying you need to add more fighters
    }
}

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
    }
}

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
                if(item.valueType === "flat")
                    participants[target].health += item.value;
                else participants[target].health += (participants[target].health * item.value);
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

    refreshBattleSlots();
}

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
}

function isBattleOver()
{
    //check if all enemies or all players are down
    let playersDown = participants.filter(participant => participant.type === "player").every(p => p.health === 0);
    let enemiesDown = participants.filter(participant => participant.type === "enemy").every(p => p.health === 0);

    if(playersDown) endBattle("p");
    else if(enemiesDown) endBattle("e");
}

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
