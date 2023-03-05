import {endBattle, isBattleOver} from "./battle.js";
import {filterBySubtype} from "./list.js";
import {refreshCardsInBattle} from "./table.js";
import {Settings} from "./settings.js";
import {handleSystemRoll, newSystemCall} from "./utils.js";
import {Status} from "./status.js";

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
                    handleRegAttack(Settings.participants[target], Settings.participants[Settings.localTurn]);
                else if(Settings.priorityTwo === false) newSystemCall("Ta akcja wymaga priorytetu 2 który został już wykorzystany.");
                else newSystemCall("Nie wybrano żadnego celu.");
                break;
            }
            case "dodge":
            {
                if(Settings.priorityTwo === true)
                    handleDodge();
                else newSystemCall("Ta akcja wymaga priorytetu 2 który został już wykorzystany.");
                break;
            }
            case "item":
            {
                if(Settings.priorityThree === true && actionElement !== "" && target !== '')
                    handleUseItem(Settings.participants[target], actionElementId);
                else if (actionElement === "") newSystemCall("Nie wybrano żadnego przedmiotu.");
                else if (target === '') newSystemCall("Nie wybrano żadnego celu.");
                else newSystemCall("Ta akcja wymaga priorytetu 3 który został już wykorzystany.");
                break;
            }
            case "skill":
            {
                if(actionElement !== '' && target !== '') {
                    let skill = Settings.skills.find(s => s.usid === actionElementId);
                    let cooldownRemaining = Settings.participants[Settings.localTurn].skillsOwned[actionElementId];
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
                        else newSystemCall("Ta akcja wymaga priorytetu " + priority + " który został już wykorzystany.");
                    }
                    else newSystemCall("Ta umiejętność jeszcze się nie odnowiła!");
                }
                else newSystemCall("Nie wybrano celu bądź umiejętności.");
                break;
            }
            case "debug":
            {
                handleDebugAction(actionElement, Settings.participants[target]);
                break;
            }
            default:
            {
                //only print errors to the console when debugging is enabled
                if(Settings.getDebuggingEnabled)
                    console.log("An error has occured, the following value was passed as action: ", action);
            }
        }
    }
    else {
        newSystemCall("Nie wybrano żadnej akcji.");
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
    let attack = attacker.attack;
    if(target.isDodging)
    {
        //target is dodging - in phase 2 avoid half the damage
        attack = Math.floor(attack / 2);
    }

    //players roll from 1-20, enemies from 1-100
    let maxRoll = participantType === "enemy" ? "d100" : "d20";
    let hitCheck = handleSystemRoll(maxRoll);

    //critical attacks double or increase the damage, check if they happened
    let criticalWeakPoint = hitCheck === 100;
    let criticalHit = (participantType === "enemy" && hitCheck >= 90) || (participantType === "player" && hitCheck === 20);
    if(criticalWeakPoint || (criticalHit && participantType === "player")) attack *= 2;
    else if (criticalHit) attack += attacker.zone;

    if(hitCheck < target.dodge)
    {
        //target avoids being hit
        attack = 0;
        newSystemCall("Rzut systemu: " + hitCheck + " (Unik)");
    }
    else if(hitCheck === target.dodge)
    {
        //target is taking half of the damage
        attack = Math.floor(attack / 2);
        if(criticalHit) newSystemCall("Rzut systemu: " + hitCheck + " (Atak Krytyczny, Połowiczny)");
        else  newSystemCall("Rzut systemu: " + hitCheck + " (Atak Połowiczny)");
    }
    else
    {
        //target is taking the whole damage
        if(criticalWeakPoint) newSystemCall("Rzut systemu: " + hitCheck + " (Krytyczny Słaby Punkt)");
        else if (criticalHit) newSystemCall("Rzut systemu: " + hitCheck + " (Krytyczny Atak)");
        else newSystemCall("Rzut systemu: " + hitCheck + " (Trafienie)");
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

    //history system call
    if (attack > 0) newSystemCall(attacker.name + " zadaje " + attack + " obrażeń " + target.name + "!");

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
        Settings.participants[Settings.localTurn].isDodging = true;
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
    let item = Settings.items.find(i => i.uiid === itemId);
    //see if the target is dead or alive
    let targetAlive = target.health > 0;
    //use the healing item
    if(targetAlive && item.subtype === "restore") restoreHp(item, target);
    else if (!targetAlive && item.subtype === "revive") restoreHp(item, target);
    else {
        newSystemCall("Nie możesz użyć tego przedmiotu na wskazanym celu.");
        itemUsed = false;
    }

    //reduce participant's item count
    if(itemUsed){
        Settings.participants[Settings.localTurn].itemsOwned[itemId] -= 1;
        Settings.priorityThree = false;

        //history system call
        newSystemCall("Użycie " + item.displayName + " na " + target.name);
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
    if (target === "everyone"){
        participantsAffected = Settings.participants;
        //history system call
        newSystemCall("Użycie umiejętności " + skill.name + " na wszystkich");
    }
    else if (target === "player" || target === "enemy"){
        participantsAffected = Settings.participants.filter(p => p.type === target);
        //history system call
        newSystemCall("Użycie umiejętności " + skill.name + " na wszyskich " + (target === "player" ? "graczy" : "przeciwników"));
    }
    else {
        if (!isNaN(target)) {
            //a single participant is the target of this skill
            participantsAffected.push(Settings.participants[target]);
            //history system call
            newSystemCall("Użycie umiejętności " + skill.name + " na " + Settings.participants[target].name);
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
    Settings.participants[Settings.localTurn].skillsOwned[skill.usid] = skill.cooldown;
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
    newSystemCall("Debug action: " + actionElement);

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
        case "setNextRoll":
        {
            let valueInserted = document.getElementById("manualInput").value;
            let valueParsed = parseInt(valueInserted);
            if(Number.isInteger(valueParsed)) {
                if(valueParsed > 0 && valueParsed < 101) {
                    Settings.setNextRollValue = valueParsed;
                    newSystemCall("Next roll value set to: " + valueParsed);
                }
                else newSystemCall("Debug input value must be an integer between 1 and 100!");
            }
            else newSystemCall("Debug input value must be a number!");
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
 * @param {Object} obj The {@link item} or {@link SkillSpell} or {@link Status} used when restoring hp
 * @param {Participant} target participant receiving hp
 * @return {number} the amount of health restored (to show in history)
 */
function restoreHp(obj, target)
{
    //statuses use property strength instead of value
    let statusObject = obj instanceof Status;
    let propertyName = statusObject ? "strength" : "value";

    //store the health of the target before the health is restored
    let currentHealth = target.health;

    if(obj.valueType === "flat"){
        if(currentHealth + obj[propertyName] > target.maxHealth)
            target.health = target.maxHealth;
        else target.health += obj[propertyName];
    }
    else {
        if(currentHealth + (target.maxHealth * obj[propertyName]) > target.maxHealth)
            target.health = target.maxHealth;
        else target.health += (target.maxHealth * obj[propertyName]);
    }

    //calculate the effect of the healing to display
    let restoredHealth = target.health - currentHealth;

    return restoredHealth;
}

/**
 * This function damages a given target
 *
 * @function damageTarget
 * @param {Object} obj The {@link item} or {@link SkillSpell} or {@link Status} used when attacking
 * @param {Participant} target participant losing hp
 * @return {number} the amount of damage dealt
 */
function damageTarget(obj, target)
{
    //store the health of the target before the attack
    let currentHealth = target.health;

    //statuses use property strength instead of value
    let statusObject = obj instanceof Status;
    let propertyName = statusObject ? "strength" : "value";

    let dmg = parseInt(obj[propertyName]);
    //damages participant by a flat value
    if (obj.valueType === "flat") {
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

    //calculate the effect of the healing to display
    let damageDealt = currentHealth - target.health;

    return damageDealt;
}

export {act, filterBySubtype, restoreHp, damageTarget};
