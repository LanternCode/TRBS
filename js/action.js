import {startBattle, refreshBattleSlots, endBattle, isBattleOver} from "./battle.js";

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
                let participantType = participants[localTurn].type;
                let attack = participants[localTurn].atk;
                if(participants[target].isDodging)
                {
                    //target is dodging - in phase 2 avoid half the damage
                    attack = Math.floor(attack / 2);
                }

                //players roll from 1-20, enemies from 1-100
                let maxRoll = participantType === "enemy" ? 100 : 20;
                let hitCheck = Math.floor(Math.random() * maxRoll) + 1;

                //critical attacks double or increase the damage, check if they happened
                let criticalWeakPoint = hitCheck === 100;
                let criticalHit = (participantType === "enemy" && hitCheck >= 90) || (participantType === "player" && hitCheck === 20);
                if(criticalWeakPoint || (criticalHit && participantType === "player")) attack *= 2;
                else if (criticalHit) attack += participants[localTurn].zone;

                if(hitCheck < participants[target].dodge)
                {
                    //target avoids being hit
                    attack = 0;
                    document.getElementById("systemThrow").innerText = hitCheck + " (unik)";
                }
                else if(hitCheck === participants[target].dodge)
                {
                    //target is taking half of the damage
                    attack = Math.floor(attack / 2);
                    if(criticalHit) document.getElementById("systemThrow").innerText = hitCheck + " (Atak Krytyczny, Połowiczny)";
                    else document.getElementById("systemThrow").innerText = hitCheck + " (Atak Połowiczny)";
                }
                else
                {
                    //target is taking the whole damage
                    if(criticalWeakPoint) document.getElementById("systemThrow").innerText = hitCheck + " (Krytyczny Słaby Punkt)";
                    else if (criticalHit) document.getElementById("systemThrow").innerText = hitCheck + " (Krytyczny Atak)";
                    else document.getElementById("systemThrow").innerText = hitCheck + " (Trafienie)";
                }

                //reduce the attack by target's armor rating
                if(attack - participants[target].armor >= 0)
                    attack -= participants[target].armor;
                else attack = 0;

                //deal damage
                let targetHealth = participants[target].health;
                if(targetHealth - attack > 0)
                    participants[target].health -= attack;
                else participants[target].health = 0;

                priorityTwo = false;
            }
            else
            {
                newSystemCall("Ta akcja wymaga priorytetu 2 który został już wykorzystany.");
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
                newSystemCall("Ta akcja wymaga priorytetu 2 który został już wykorzystany.");
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
                newSystemCall("Ta akcja wymaga priorytetu 3 który został już wykorzystany.");
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
 * This function updates the message sent to the user after a system call
 *
 * @function newSystemCall
 * @param {string} call - The new message to show to the user
 * @return {void}
 */
function newSystemCall(call)
{
    document.getElementById("systemCall").innerText = call;
}


export {nextTurn, act, updateItemList, newSystemCall};
