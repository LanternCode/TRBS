import {isBattleOver} from "./battle.js";
import {adjustOptions} from "./list.js";
import {refreshCardsInBattle} from "./card.js";

/**
 * This function ends the current local/global turn
 *
 * @function nextTurn
 * @return {void}
 */
function nextTurn()
{
    //check if the battle is over and end it if so, else continue
    if(!isBattleOver()){
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
        //this has to be disabled now in case a defeated member was revived
        participants[localTurn].isDodging = 0;

        //Check if the participant is alive, if not, start next turn
        if(participants[localTurn].health === 0) nextTurn();

        //reset the action list
        action.value = "none";
        adjustOptions(true);

        //reset the available action flags
        let priorityTwoActionFlag = document.getElementById("priorityTwoActionFlag");
        let priorityThreeActionFlag = document.getElementById("priorityThreeActionFlag");
        priorityTwoActionFlag.classList.remove("disabled");
        priorityThreeActionFlag.classList.remove("disabled");
        priorityTwo = true;
        priorityThree = true;

        //reset system throw display
        document.getElementById("systemThrow").innerText = "";

        //reset system call display
        newSystemCall("");

        //Update the "acts now" label
        document.getElementById("nowActsDesc").innerText = participants[localTurn].name;
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
            if(priorityTwo === true && target !== '' )
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
                    document.getElementById("systemThrow").innerText = hitCheck + " (Unik)";
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

                if (attack > 0) newSystemCall("Zadano " + attack + " obrażeń!");

                priorityTwo = false;
            }
            else if(target.length < 2)
            {
                newSystemCall("Nie wybrano celu ataku.");
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
            if(priorityThree === true && item_key.length > 1 && target.length > 1)
            {
                console.log(target);
                console.log(participants[target]);
                let itemUsed = true;
                //find the item in the item list
                let item = items.find(i => i.name === item_key);
                //see if the target is dead or alive
                let targetAlive = participants[target].health > 0;
                //use the healing item
                if(targetAlive && item.subtype === "restore") restoreHp(item, participants[target]);
                else if (!targetAlive && item.subtype === "revive") restoreHp(item, participants[target]);
                else {
                    newSystemCall("Nie możesz użyć tego przedmiotu na wskazanym celu.");
                    itemUsed = false;
                }

                //reduce participant's item count
                if(itemUsed){
                    participants[localTurn].itemsOwned[item_key] -= 1;
                    priorityThree = false;
                }
            }
            else if(item_key.length < 2)
            {
                newSystemCall("Nie wybrano żadnego przedmiotu.");
            }
            else if(target.length < 2)
            {
                newSystemCall("Nie wybrano żadnego celu.");
            }
            else
            {
                newSystemCall("Ta akcja wymaga priorytetu 3 który został już wykorzystany.");
            }
            break;
        }
        default:
        {
            newSystemCall("Nie wybrano żadnej akcji.");
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
    if(!isBattleOver()) refreshCardsInBattle();
}

function restoreHp(item, target)
{
    if(item.valueType === "flat"){
        if(target.health + item.value > target.maxHealth)
            target.health = target.maxHealth;
        else target.health += item.value;
    }
    else {
        if(target.health + (target.maxHealth * item.value) > target.maxHealth)
            target.health = target.maxHealth;
        else target.health += (target.maxHealth * item.value);
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


export {nextTurn, act, newSystemCall};
