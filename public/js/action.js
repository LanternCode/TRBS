import {endBattle, isBattleOver} from "./battle.js";
import {filterBySubtype} from "./list.js";
import {refreshCardsInBattle} from "./table.js";
import {Settings} from "./settings.js";
import {getRndInteger, handleSystemRoll, newSystemCall} from "./utils.js";
import {StatsAffected, Status} from "./status.js";

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

    //process persistent statuses effective "onAct"
    let activeOnActStatuses = Status.getParticipantsPersistentStatuses(Settings.participants[Settings.localTurn], "onAct");
    if(activeOnActStatuses.includes("confusion")) {
        //confusion status randomises the action target
        let targetsAvailable = Settings.participants;
        let randomisedTarget = getRndInteger(0, targetsAvailable.length-1);
        target = randomisedTarget;
        Status.advancePersistentStatus(Settings.participants[Settings.localTurn], "confusion");
    }
    let extraAttackAvailable = false;
    let extraAttackUsed = false;
    if(activeOnActStatuses.includes("extraAttack")) {
        if(Settings.priorityTwo === false) {
            //extraAttack allows the participant to perform an extra priority 2 attack action
            extraAttackAvailable = true;
        }
    }

    //The switches will handle action "security" and then pass the action to the appropriate handler
    if(action !== '') {
        switch(action)
        {
            case "regAttack":
            {
                if(Settings.priorityTwo || extraAttackAvailable) {
                    if (!Settings.priorityTwo)
                        extraAttackUsed = true;
                    handleRegAttack(Settings.participants[target], Settings.participants[Settings.localTurn]);
                }
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
                        else if (extraAttackAvailable) {
                            priorityClear = true;
                            extraAttackUsed = true;
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
        if(extraAttackUsed) {
            Status.advancePersistentStatus(Settings.participants[Settings.localTurn], "extraAttack");
        }
    }
    else {
        newSystemCall("Nie wybrano żadnej akcji.");
    }

    //mark unavailable actions
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

    //handle the "perfection" status
    let perfectAttack = false;
    let activeOnActStatuses = Status.getParticipantsPersistentStatuses(Settings.participants[Settings.localTurn], "onAct");
    if(activeOnActStatuses.includes("perfection")) {
        //perfection status makes an attack always hit
        hitCheck = target.dodge++;
        perfectAttack = true;
        Status.advancePersistentStatus(Settings.participants[Settings.localTurn], "perfection");
    }

    //critical attacks double or increase the damage, check if they happened
    let criticalWeakPoint = hitCheck === 100;
    let criticalHit = (participantType === "enemy" && hitCheck >= 90) || (participantType === "player" && hitCheck === 20);
    if((criticalWeakPoint || (criticalHit && participantType === "player")) && !perfectAttack) attack *= 2;
    else if (criticalHit && !perfectAttack) attack += parseInt(attacker.zone);

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

    //See if the impact status is present and apply it if so
    attack = attack > 0 ? applyImpact(attack, target) : 0;

    //reduce the attack by target's armor rating
    if(attack - target.armor >= 0)
        attack -= target.armor;
    else attack = 0;

    //deal damage
    let targetHealth = target.health;
    if(targetHealth - attack > 0)
        target.health -= attack;
    else target.health = 0;

    //check "onDeath" persistent statuses
    if(target.health === 0) {
        //see if there remains only 1 alive participant in the target's team
        let aliveTargetTypeParticipantsArr = Settings.participants.filter(p => p.type === target.type && p.health > 0);
        if(aliveTargetTypeParticipantsArr.length === 1) {
            //see if the participant is affected by the "fury" status
            let activeOnDeathStatuses = Status.getParticipantsPersistentStatuses(aliveTargetTypeParticipantsArr[0], "onDeath");
            if(activeOnDeathStatuses.includes("fury")) {
                let furyStatusFound = activeOnDeathStatuses.filter(s => s.name === "fury")[0];
                //fury restores hp and increases damage
                aliveTargetTypeParticipantsArr[0].health += furyStatusFound.strength;
                StatsAffected.applyStatusStatModifiers(aliveTargetTypeParticipantsArr[0], furyStatusFound);
                //update the status to a global status - this way the effect of the stat mod will wear off after the desired number of turns
                let newFuryStatus = structuredClone(furyStatusFound);
                newFuryStatus.effectiveTurn = "global";
                newFuryStatus.effectiveAt = "end";
                //replace the current status with the new status
                Status.replaceParticipantStatus(aliveTargetTypeParticipantsArr[0], furyStatusFound, newFuryStatus);
            }
        }
    }

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
    //history system call
    newSystemCall("Użycie " + item.displayName + " na " + target.name);
    //see if the target is dead or alive
    let targetAlive = target.health > 0;
    //use the healing item
    if(targetAlive && item.subtype === "restore") restoreHp(item, target);
    else if (!targetAlive && item.subtype === "revive") restoreHp(item, target);
    else if (targetAlive && item.type === "statModifier") {
        //apply statuses of the item
        if(Object.keys(item.statusesApplied || {}).length > 0) {
            for(let s of item.statusesApplied) {
                let status = s;
                let statusReady = (typeof s) === "object";
                if(!statusReady) {
                    //fetch the full status based on the name
                    status = Settings.statuses.filter(st => st.name === s);
                }
                Status.applyStatus(target, structuredClone(status[0]));
            }
        }
    } else if (targetAlive && item.type === "statusRemover") {
        //remove all clearable statuses of the target
        Status.voidParticipantStatuses(target);
    }
    else {
        newSystemCall("Nie udało się użyć tego przedmiotu na wskazanym celu.");
    }

    //reduce participant's item count
    Settings.participants[Settings.localTurn].itemsOwned[itemId] -= 1;
    Settings.priorityThree = false;
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

        //apply statuses of the skill
        if(Object.keys(skill.statusesApplied || {}).length > 0) {
            for(let s of skill.statusesApplied) {
                let status = s;
                let statusReady = (typeof s) === "object";
                if(!statusReady) {
                    //fetch the full status based on the name
                    status = Settings.statuses.filter(st => st.name === s);
                }
                Status.applyStatus(p, structuredClone(status[0]));
            }
        }
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
    let statusObject = Object.hasOwn(obj, "strength");
    let propertyName = statusObject ? "strength" : "value";
    let typePropertyName = statusObject ? "strengthType" : "valueType";

    //store the health of the target before the health is restored
    let startingHealth = target.health;

    //see if the 'shrapnel' status is present that reduces healing by a half
    let healthToRestore = applyShrapnel(obj[propertyName], target);

    if(obj[typePropertyName] === "flat"){
        if(target.health + healthToRestore > target.maxHealth)
            target.health = target.maxHealth;
        else target.health += healthToRestore;
    }
    else {
        if(target.health + (target.maxHealth * healthToRestore) > target.maxHealth)
            target.health = target.maxHealth;
        else target.health += (target.maxHealth * healthToRestore);
    }

    return target.health - startingHealth;
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
    //statuses use property strength instead of value
    let statusObject = Object.hasOwn(obj, "strength");
    let propertyName = statusObject ? "strength" : "value";
    let typePropertyName = statusObject ? "strengthType" : "valueType";

    let startingHealth = target.health;
    let dmg = applyImpact(parseInt(obj[propertyName]), target);

    //damages participant by a flat value
    if (obj[typePropertyName] === "flat") {
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

    return startingHealth - target.health;
}

/**
 * Utility function that calculates the damage of an Impact-affected attack
 * It also advances the status if it was applied to the attack
 *
 * To be removed or reconstructed once Skills are separated from Spells
 *
 * @param {int} damage the damage to apply impact to
 * @param {Participant} target the target of the attack
 * @returns {int} damage with impact applied
 */
function applyImpact(damage, target) {
    let damageTotal = damage;
    let activeOnDamageStatuses = Status.getParticipantsPersistentStatuses(Settings.participants[Settings.localTurn], "onDamage");
    if(activeOnDamageStatuses.includes("impact")) {
        //impact status may double or quadruple damage
        let impactMultiplier = 1;
        if (Settings.participants[Settings.localTurn].health <= Settings.participants[Settings.localTurn].maxHealth * 0.5) {
            impactMultiplier *= 2;
        }
        if (target.health <= target.maxHealth * 0.5) {
            impactMultiplier *= 2;
        }
        if(impactMultiplier > 1) {
            damageTotal *= impactMultiplier;
            Status.advancePersistentStatus(Settings.participants[Settings.localTurn], "impact");
        }
    }
    return damageTotal;
}

/**
 * Utility function that calculates the healing of a shrapnel-affected action
 * It also advances the status if it was applied
 *
 * To be removed or reconstructed once Skills are separated from Spells
 *
 * @param {int} healing the value of healing
 * @param {Participant} target the target of the healing effect
 * @returns {int} the post-shrapnel value of healing
 */
function applyShrapnel(healing, target) {
    let activeOnHealingStatuses = Status.getParticipantsPersistentStatuses(target, "onHealing");
    if(activeOnHealingStatuses.includes("shrapnel")) {
        //shrapnel reduces healing by half
        let healingPostShrapnel = Math.floor(healing * 0.5);
        Status.advancePersistentStatus(target, "shrapnel");
        return healingPostShrapnel;
    }
    else return healing;
}

export {act, filterBySubtype, restoreHp, damageTarget};
