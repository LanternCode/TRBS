//pre-defined players array
const players = [
    {
        name: 'Miles',
        health: 100,
        speed: 81,
        atk: 20,
        uuid: 0,
        isDodging: 0,
        type: "player"
    },
    {
        name: 'Churchie',
        health: 90,
        speed: 82,
        atk: 15,
        uuid: 0,
        isDodging: 0,
        type: "player"
    },
    {
        name: 'Crownsnek',
        health: 80,
        speed: 17,
        atk: 10,
        uuid: 0,
        isDodging: 0,
        type: "player"
    }];

//pre-defined enemies array
const enemies = [
    {
        name: 'Przeciwnik 1',
        health: 100,
        speed: 88,
        atk: 20,
        uuid: 0,
        isDodging: 0,
        type: "enemy"
    },
    {
        name: 'Przeciwnik 2',
        health: 100,
        speed: 12,
        atk: 20,
        uuid: 0,
        isDodging: 0,
        type: "enemy"
    },
    {
        name: 'Przeciwnik 3',
        health: 100,
        speed: 36,
        atk: 20,
        uuid: 0,
        isDodging: 0,
        type: "enemy"
    }];

//pre-defined, empty participants array
let participants = [];

//pre-defined counters
let globalTurn = 1;
let localTurn = 0;

//pre-defined flags
let priorityTwo = true;
let priorityThree = true;

function startBattle()
{
    //update the array with details of players and enemies so the originals are not modified
    participants = structuredClone(players);
    participants = participants.concat(structuredClone(enemies));

    //sort the array by speed to establish turn order
    participants.sort((a, b) => b.speed - a.speed);

    //Update the battle state description
    document.getElementById("battleStatus").innerText = "W trakcie!";

    //Hide the start battle button and show the next turn button
    document.getElementById("startBattleButton").style.display = "none";
    document.getElementById("nextTurnButton").style.display = "block";

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

function refreshBattleSlots()
{
    let playersUpdated = 0;
    const playersCount = players.length;
    let enemiesUpdated = 0;

    //Prepare the battle slots
    for(let i = 0; i < participants.length; ++i)
    {
        let battleSlot = "";
        //find the correct battle slot
        if(participants[i].type === "player")
        {
            battleSlot = document.getElementById("participant-"+playersUpdated);
            playersUpdated++;
        }
        else if(participants[i].type === "enemy")
        {
            battleSlot = document.getElementById("participant-"+(playersCount+enemiesUpdated));
            enemiesUpdated++;
        }
        //update the display properties
        battleSlot.children[0].innerText = participants[i].name;
        battleSlot.children[2].innerText = participants[i].health;
        battleSlot.children[4].innerText = participants[i].speed;
        battleSlot.children[6].innerText = participants[i].atk;
    }
}

function act()
{
    let action = document.getElementById("action").value;
    let target = document.getElementById("targetsList").value;
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
                    //target is dodging - in phase 1 avoid all damage
                }
                else
                {
                    let targetHealth = participants[target].health;
                    if(targetHealth - attack > 0)
                        participants[target].health -= attack;
                    else participants[target].health = 0;
                }
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
    document.getElementById("nextTurnButton").style.display = "none";
    document.getElementById("startBattleButton").style.display = "block";
}

function isBattleOver()
{
    //check if all enemies or all players are down
    let playersDown = participants.filter(participant => participant.type === "player").every(p => p.health === 0);
    let enemiesDown = participants.filter(participant => participant.type === "enemy").every(p => p.health === 0);

    if(playersDown) endBattle("p");
    else if(enemiesDown) endBattle("e");
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
}

//removes all children
//myNode.innerHTML = '';
