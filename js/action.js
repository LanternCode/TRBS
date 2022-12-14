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
        adjustOptions("reset");

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
    let action = document.getElementById("actionList").value;
    let actionElement = document.getElementById("actionElementsList").value;
    let actionElementType = actionElement.split("-")[0];
    let actionElementId = parseInt(actionElement.split("-")[1]);
    let target = document.getElementById("targetsList").value;
    let priorityTwoActionFlag = document.getElementById("priorityTwoActionFlag");
    let priorityThreeActionFlag = document.getElementById("priorityThreeActionFlag");

    //The switches will handle action "security" and then pass the action to the appropriate handler
    if(action !== '') {
        switch(action)
        {
            case "regAttack":
            {
                if(Settings.priorityTwo === true)
                    handleRegAttack(participants[target], participants[Settings.localTurn]);
                else if(Settings.priorityTwo === false) newSystemCall("Ta akcja wymaga priorytetu 2 kt??ry zosta?? ju?? wykorzystany.");
                else newSystemCall("Nie wybrano ??adnego celu.");
                break;
            }
            case "dodge":
            {
                if(Settings.priorityTwo === true)
                    handleDodge();
                else newSystemCall("Ta akcja wymaga priorytetu 2 kt??ry zosta?? ju?? wykorzystany.");
                break;
            }
            case "item":
            {
                if(Settings.priorityThree === true && actionElement !== "" && target !== '')
                    handleUseItem(participants[target], actionElementId);
                else if (actionElement === "") newSystemCall("Nie wybrano ??adnego przedmiotu.");
                else if (target === '') newSystemCall("Nie wybrano ??adnego celu.");
                else newSystemCall("Ta akcja wymaga priorytetu 3 kt??ry zosta?? ju?? wykorzystany.");
                break;
            }
            case "skill":
            {
                if(actionElement !== '' && target !== '') {
                    let skill = skills.find(s => s.usid === actionElementId);
                    let cooldownRemaining = participants[Settings.localTurn].skillsOwned[actionElementId];
                    if (cooldownRemaining === 0) {
                        let priority = skill.priority;
                        let priorityClear = false;
                        if (priority === 2 && Settings.priorityTwo) {
                            priorityClear = true;
                            Settings.priorityTwo = false;
                        }
                        else if (priority === 3 && Settings.priorityThree) {
                            priorityClear = true;
                            Settings.priorityThree = false;
                        }
                        if(priorityClear)
                            handleUseSkill(skill, target);
                        else newSystemCall("Ta akcja wymaga priorytetu " + priority + " kt??ry zosta?? ju?? wykorzystany.");
                    }
                    else newSystemCall("Ta umiej??tno???? jeszcze si?? nie odnowi??a!");
                }
                else newSystemCall("Nie wybrano celu b??d?? umiej??tno??ci.");
                break;
            }
            case "debug":
            {
                handleDebugAction(actionElement, participants[target]);
                break;
            }
            default:
            {
                //only print errors to the console when debugging is enabled
                if(Settings.debuggingEnabled())
                    console.log("An error has occured, the following value was passed as action: ", action);
            }
        }
    }
    else {
        newSystemCall("Nie wybrano ??adnej akcji.");
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
 * This function handles a regular attack of the attacker.
 *
 * @function handleRegAttack
 * @param {Participant} target the target of the attack
 * @param {Participant} attacker the attacking participant
 * @return void
 */
function handleRegAttack(target, attacker)
{
    let participantType = attacker.type;
    let attack = attacker.atk;
    if(target.isDodging)
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
    else if (criticalHit) attack += attacker.zone;

    if(hitCheck < target.dodge)
    {
        //target avoids being hit
        attack = 0;
        document.getElementById("systemThrow").innerText = hitCheck + " (Unik)";
    }
    else if(hitCheck === target.dodge)
    {
        //target is taking half of the damage
        attack = Math.floor(attack / 2);
        if(criticalHit) document.getElementById("systemThrow").innerText = hitCheck + " (Atak Krytyczny, Po??owiczny)";
        else document.getElementById("systemThrow").innerText = hitCheck + " (Atak Po??owiczny)";
    }
    else
    {
        //target is taking the whole damage
        if(criticalWeakPoint) document.getElementById("systemThrow").innerText = hitCheck + " (Krytyczny S??aby Punkt)";
        else if (criticalHit) document.getElementById("systemThrow").innerText = hitCheck + " (Krytyczny Atak)";
        else document.getElementById("systemThrow").innerText = hitCheck + " (Trafienie)";
    }

    //reduce the attack by target's armor rating
    if(attack - target.armor >= 0)
        attack -= target.armor;
    else attack = 0;

    //deal damage
    let targetHealth = target.health;
    if(targetHealth - attack > 0)
        target.health -= attack;
    else target.health = 0;

    if (attack > 0) newSystemCall("Zadano " + attack + " obra??e??!");

    Settings.priorityTwo = false;
}

/**
 * This function enables a target's dodge. If target is not specified,
 * dodge will be activated for the currently acting participant.
 * This is devised so that if some ability wants to also activate
 * someone's dodge in the future, they can just use this function.
 *
 * @function handleDodge
 * @param {Participant} [target] target to enable the dodge for
 * @return void
 */
function handleDodge(target = {})
{
    if(target !== {})
        participants[Settings.localTurn].isDodging = true;
    else target.isDodging = true;
    Settings.priorityTwo = false;
}

/**
 * This function takes an item id and a target to use the item on.
 * If it is possible, the target will have hp restored, or they will be
 * revived if they died earlier.
 *
 * @function handleUseItem
 * @param {Participant} target participant to use the item on
 * @param {int} itemId item id
 * @return void
 */
function handleUseItem(target, itemId)
{
    let itemUsed = true;
    //find the item in the item list
    let item = items.find(i => i.uiid === itemId);
    //see if the target is dead or alive
    let targetAlive = target.health > 0;
    //use the healing item
    if(targetAlive && item.subtype === "restore") restoreHp(item, target);
    else if (!targetAlive && item.subtype === "revive") restoreHp(item, target);
    else {
        newSystemCall("Nie mo??esz u??y?? tego przedmiotu na wskazanym celu.");
        itemUsed = false;
    }

    //reduce participant's item count
    if(itemUsed){
        participants[Settings.localTurn].itemsOwned[itemId] -= 1;
        Settings.priorityThree = false;
    }
}

/**
 * This function takes a skill and a target to use the skill on that target
 *
 * @function handleUseSkill
 * @param {SkillSpell} skill The skill to use
 * @param {string|int} target A group or an individual participant to target
 * @return void
 */
function handleUseSkill(skill, target)
{
    //fetch skill properties
    let participantsAffected = [];
    let type = skill.type;
    let subtype = skill.subtype;
    //check if a special target was selected
    if (target === "everyone")
        participantsAffected = participants;
    else if (target === "player" || target === "enemy")
        participantsAffected = participants.filter(p => p.type === target);
    else {
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
    participants[Settings.localTurn].skillsOwned[skill.usid] = skill.cooldown;
}

/**
 * This function handles a debugging action selected by the user
 *
 * @function handleDebugAction
 * @param {string} actionElement
 * @param {Participant} target
 * @return void
 */
function handleDebugAction(actionElement, target)
{
    switch(actionElement)
    {
        case "defeatParticipant":
        {
            if(target.hasOwnProperty("health")) {
                target.health = 0;
            }
            else newSystemCall("Nie wybrano celu.");
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
 * This function damages a given target using an item or a skill
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
