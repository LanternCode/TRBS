import {endBattle, isBattleOver} from "./battle.js";
import {adjustOptions, filterBySubtype} from "./list.js";
import {refreshCardsInBattle} from "./card.js";
import {Settings} from "./settings.js";

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
        Settings.localTurn++;

        //check if this was the last local turn of the global turn
        if(Settings.localTurn === participants.length)
        {
            Settings.localTurn = 0;
            Settings.globalTurn++;
            document.getElementById("globalTurn").innerText = Settings.globalTurn;

            //reduce skill cooldown for any skill by 1
            for (let i = 0; i < participants.length; ++i) {
                //check if participant has any skills
                if(participants[i].hasOwnProperty("skillsOwned")) {
                    Object.entries(participants[i].skillsOwned).forEach(
                        s => {
                            if(s[1] > 0)
                                participants[i].skillsOwned[s[0]]--;
                        }
                    );
                }
            }
        }

        //if the member was dodging, disable their dodge once their turn starts again
        //this has to be disabled now in case a defeated member was revived
        participants[Settings.localTurn].isDodging = 0;

        //Check if the participant is alive, if not, start next turn
        if(participants[Settings.localTurn].health === 0) nextTurn();

        //reset the action list
        action.value = "none";
        adjustOptions(true);

        //reset the available action flags
        let priorityTwoActionFlag = document.getElementById("priorityTwoActionFlag");
        let priorityThreeActionFlag = document.getElementById("priorityThreeActionFlag");
        priorityTwoActionFlag.classList.remove("disabled");
        priorityThreeActionFlag.classList.remove("disabled");
        Settings.priorityTwo = true;
        Settings.priorityThree = true;

        //reset system throw display
        document.getElementById("systemThrow").innerText = "";

        //reset system call display
        newSystemCall("");

        //Update the "acts now" label
        document.getElementById("nowActsDesc").innerText = participants[Settings.localTurn].name;
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
    let skill_key = document.getElementById("skillsList").value;
    let testing_key = document.getElementById("testingList").value;
    let priorityTwoActionFlag = document.getElementById("priorityTwoActionFlag");
    let priorityThreeActionFlag = document.getElementById("priorityThreeActionFlag");

    switch(action)
    {
        case "attack":
        {
            if(Settings.priorityTwo === true && target !== '')
            {
                let participantType = participants[Settings.localTurn].type;
                let attack = participants[Settings.localTurn].atk;
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
                else if (criticalHit) attack += participants[Settings.localTurn].zone;

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

                Settings.priorityTwo = false;
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
            if(Settings.priorityTwo === true)
            {
                participants[Settings.localTurn].isDodging = 1;
                Settings.priorityTwo = false;
            }
            else
            {
                newSystemCall("Ta akcja wymaga priorytetu 2 który został już wykorzystany.");
            }
            break;
        }
        case "item":
        {
            if(Settings.priorityThree === true && item_key.length > 1 && target !== '')
            {
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
                    participants[Settings.localTurn].itemsOwned[item_key] -= 1;
                    Settings.priorityThree = false;
                }
            }
            else if(item_key.length < 2)
            {
                newSystemCall("Nie wybrano żadnego przedmiotu.");
            }
            else if(target.length === '')
            {
                newSystemCall("Nie wybrano żadnego celu.");
            }
            else
            {
                newSystemCall("Ta akcja wymaga priorytetu 3 który został już wykorzystany.");
            }
            break;
        }
        case "skill":
        {
            //check that a skill was selected
            if(skill_key !== ''){
                //check that a valid target was selected
                if(target !== '') {
                    //get the selected skill and check the cooldown
                    let skill = skills.find(s => s.name === skill_key);
                    let cooldownRemaining = participants[Settings.localTurn].skillsOwned[skill_key];
                    if (cooldownRemaining === 0) {
                        //check if this priority is available
                        let priority = skill.priority;
                        let priorityClear = false;
                        if (priority === 2 && Settings.priorityTwo) {
                            priorityClear = true;
                            Settings.priorityTwo = false;
                        } else if (priority === 3 && Settings.priorityThree) {
                            priorityClear = true;
                            Settings.priorityThree = false;
                        }
                        if(priorityClear) {
                            //fetch skill properties
                            let participantsAffected = [];
                            let type = skill.type;
                            let subtype = skill.subtype;
                            //check if a special target was selected
                            if (target === "everyone") {
                                //all participants are affected
                                participantsAffected = participants;
                            } else if (target === "player" || target === "enemy") {
                                //all players or all enemies are the target of this skill
                                participantsAffected = participants.filter(p => p.type === target);
                            } else {
                                //check that a numeric target was supplied
                                if (!isNaN(target)) {
                                    //a single participant is the target of this skill
                                    participantsAffected.push(participants[target]);
                                }
                            }

                            //only include dead or alive participants based on the subtype of the skill
                            participantsAffected = filterBySubtype(participantsAffected, subtype);

                            //apply the effects of the skill (healing/damaging)
                            for (let p of participantsAffected) {
                                if (type === "healing")
                                    restoreHp(skill, p);
                                else if (type === "offensive")
                                    damageTarget(skill, p);
                            }

                            //set the skill on cooldown
                            participants[Settings.localTurn].skillsOwned[skill_key] = skill.cooldown;
                        }
                        else {
                            newSystemCall("Ta akcja wymaga priorytetu " + priority + " który został już wykorzystany.");
                        }
                    }
                    else {
                        newSystemCall("Ta umiejętność jeszcze się nie odnowiła!");
                    }
                }
                else {
                    newSystemCall("Nie wybrano celu.");
                }
            }
            else {
                newSystemCall("Nie wybrano umiejętności.");
            }
            break;
        }
        case "testing":
        {
            switch(testing_key)
            {
                case "defeatParticipant":
                {
                    participants[target].health = 0;
                    break;
                }
                case "winBattle":
                {
                    endBattle("p");
                    break;
                }
                case "loseBattle":
                {
                    endBattle("e");
                    break;
                }
                default:
                {
                    break;
                }
            }
            break;
        }
        default:
        {
            newSystemCall("Nie wybrano żadnej akcji.");
        }
    }

    // mark unavailable actions
    if(Settings.priorityTwo === false)
    {
        priorityTwoActionFlag.classList.add("disabled");
    }
    if(Settings.priorityThree === false)
    {
        priorityThreeActionFlag.classList.add("disabled");
    }

    //check if the battle is over
    if(!isBattleOver()) refreshCardsInBattle();
}

/**
 * This function restores hp to a given target
 *
 * @function restoreHp
 * @param {Object} obj The {@link item} or {@link SkillSpell} used when restoring hp
 * @param {Participant} target participant receiving hp
 * @return {void}
 */
function restoreHp(obj, target)
{
    if(obj.valueType === "flat"){
        if(target.health + obj.value > target.maxHealth)
            target.health = target.maxHealth;
        else target.health += obj.value;
    }
    else {
        if(target.health + (target.maxHealth * obj.value) > target.maxHealth)
            target.health = target.maxHealth;
        else target.health += (target.maxHealth * obj.value);
    }
}

/**
 * This function restores hp to a given target
 *
 * @function damageTarget
 * @param {Object} obj The {@link item} or {@link SkillSpell} used when attacking
 * @param {Participant} target participant losing hp
 * @return {void}
 */
function damageTarget(obj, target)
{
    let dmg = parseInt(obj.value);
    //damages participant by a flat value
    if(obj.valueType === "flat"){
        if(target.health - dmg > 0)
            target.health -= dmg;
        else target.health = 0;
    }
    else {
        //damages participant by a % of their max hp
        if(target.health - (target.maxHealth * dmg) > 0)
            target.health -= (target.maxHealth * dmg);
        else target.health = 0;
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

export {nextTurn, act, newSystemCall, filterBySubtype};
