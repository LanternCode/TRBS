import {endBattle, isBattleOver} from "./battle.js";
import {filterBySubtype} from "./list.js";
import {refreshCardsInBattle} from "./table.js";
import {Settings} from "./settings.js";
import {getRndInteger, handleSystemRoll, newSystemCall, randomSystemRoll} from "./utils.js";
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
    //let actionElementType = actionElement.split("-")[0];
    let actionElementId = parseInt(actionElement.split("-")[1]);
    let target = document.getElementById("targetsList").value;
    let priorityTwoActionFlag = document.getElementById("priorityTwoActionFlag");
    let priorityThreeActionFlag = document.getElementById("priorityThreeActionFlag");

    //process the "confusion" status
    let activeOnActStatuses = Status.getParticipantsPersistentStatuses(Settings.participants[Settings.localTurn], "onAct");
    if(activeOnActStatuses.includes("confusion")) {
        //confusion status randomises the action target
        let targetsAvailable = Settings.participants;
        target = getRndInteger(0, targetsAvailable.length-1);
        Status.advancePersistentStatus(Settings.participants[Settings.localTurn], "confusion");
    }
    //process the "object" status
    let isObject = false;
    if(activeOnActStatuses.includes("object")) {
        isObject = true;
    }
    //process the "extraAttack" status
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
                if(isObject)
                    newSystemCall("Obiekty nie mogą atakować!");
                else if((Settings.priorityTwo || extraAttackAvailable) && target !== '') {
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
            case "escape":
            {
                //the instant escape status ignores the usual escape check
                let activeOnEscapeStatuses = Status.getParticipantsPersistentStatuses(Settings.participants[Settings.localTurn], "onEscape");
                let instantEscape = false;
                if(activeOnEscapeStatuses.includes("instantEscape"))
                    instantEscape = true;

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

    //process the "blind" status
    let activeOnHitStatuses = Status.getParticipantsPersistentStatuses(Settings.participants[Settings.localTurn], "onHit");
    let activeTargetStatuses = Status.getParticipantsPersistentStatuses(target, "onHit");
    if(activeOnHitStatuses.includes("blind")) {
        //blindness reduces the participant's hit chance by D4+1
        let reduction = randomSystemRoll(4)+1;
        hitCheck = (hitCheck - reduction) < 0 ? 0 : (hitCheck - reduction);
    }
    //process the "focus" status
    if(activeOnHitStatuses.includes("focus")) {
        //focus increases the participant's hit chance by 5
        hitCheck = participantType === "enemy" ? ((hitCheck + 5) > 100 ? 100 : (hitCheck + 5)) : ((hitCheck + 5) > 20 ? 20 : (hitCheck + 5));
    }
    //process the "perfection" status
    let perfectAttack = false;
    if(activeOnHitStatuses.includes("perfection")) {
        //perfection status makes an attack always hit
        hitCheck = target.dodge + 1;
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

    //process the "illusion" status
    if(activeTargetStatuses.includes("illusion")) {
        //fetch the status
        let illusionStatus = target.statusesApplied.filter(s => s.name === "illusion")[0];
        //illusion requires the target to have attacked the attacked first
        if(illusionStatus.hasOwnProperty("linkedTargetsList")) {
            if(!illusionStatus.linkedTargetsList.includes(Settings.localTurn)) {
                //if the target is not in the list, the attack "goes through them"
                attack = 0;
            }
        }
    }

    //illusion, cont. - by attacking a target, they will be added to the illusion status' list
    if(activeOnHitStatuses.includes("illusion") && attack > 0) {
        //fetch the status
        let illusionStatus = attacker.statusesApplied.filter(s => s.name === "illusion")[0];
        let targetParticipantNo = Settings.participants.indexOf(Settings.participants.filter(p => p.name === target.name)[0]);
        if(illusionStatus.hasOwnProperty("linkedTargetsList")) {
            if(illusionStatus.linkedTargetsList.indexOf(targetParticipantNo) === -1) {
                illusionStatus.linkedTargetsList.push(targetParticipantNo);
            }
        }
        else {
            illusionStatus.linkedTargetsList = [];
            illusionStatus.linkedTargetsList.push(targetParticipantNo);
        }
    }

    //process the "impact" status
    attack = attack > 0 ? applyImpact(attack, target) : 0;

    //process the "deep wounds" status
    let activeOnDamageStatuses = Status.getParticipantsPersistentStatuses(target, "onDamage");
    if(activeOnDamageStatuses.includes("deepWounds")) {
        //only increase the damage of an attack if it actually hits
        if(attack > 0) {
            let deepWoundsStatus = target.statusesApplied.filter(s => s.name === "deepWounds")[0];
            attack += deepWoundsStatus.strength;
            Status.advancePersistentStatus(target, "deepWounds");
        }
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

    //process the "fury" status
    if(target.health === 0) {
        //see if there remains only 1 alive participant in the target's team
        let aliveTargetTypeParticipantsArr = Settings.participants.filter(p => p.type === target.type && p.health > 0);
        if(aliveTargetTypeParticipantsArr.length === 1) {
            //see if the participant is affected by the "fury" status
            let activeOnDeathStatuses = Status.getParticipantsPersistentStatuses(aliveTargetTypeParticipantsArr[0], "onDeath");
            if(activeOnDeathStatuses.includes("fury")) {
                //fury restores hp
                let furyStatusFound = aliveTargetTypeParticipantsArr[0].statusesApplied.filter(s => s.name === "fury")[0];
                let tHp = aliveTargetTypeParticipantsArr[0].health;
                let mHp = aliveTargetTypeParticipantsArr[0].maxHealth;
                aliveTargetTypeParticipantsArr[0].health = tHp + furyStatusFound.strength > mHp ? mHp : tHp + furyStatusFound.strength;
                //update the status to a global status - this way the effect of the stat mod will wear off after the desired number of turns
                furyStatusFound.effectiveTurn = "global";
                furyStatusFound.effectiveAt = "end";
                StatsAffected.applyStatusStatModifiers(aliveTargetTypeParticipantsArr[0], furyStatusFound);
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
    else if (targetAlive && item.type === "statusRemover") {
        //remove all clearable statuses of the target
        Status.voidParticipantStatuses(target);
    }
    else if(item.type === "special") {
        //first multiply the attack by 3
        target.attack *= 3;
        //randomise two targets - one must be of reverse type to us
        let reverseType = target.type === "player" ? "enemy" : "player";
        let firstTargetArray = Settings.participants.filter(p => p.type === reverseType);
        let firstTarget = firstTargetArray[randomSystemRoll(firstTargetArray.length)-1];
        let secondTarget = Settings.participants[randomSystemRoll(Settings.participants.length)-1];
        //attack the two targets
        handleRegAttack(firstTarget, target);
        handleRegAttack(secondTarget, target);
        //stun the target of the potion
        Status.applyStatus(target, Settings.statuses.filter(s => s.name === "stun")[0]);
        //bring the attack back to the original number
        target.attack /= 3;
    }
    else {
        itemUsed = false;
        newSystemCall("Nie udało się użyć tego przedmiotu na wskazanym celu.");
    }

    //apply statuses of the item
    if (targetAlive) {
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
    }

    //reduce participant's item count
    if(itemUsed) {
        Settings.participants[Settings.localTurn].itemsOwned[itemId] -= 1;
        Settings.priorityThree = false;
    }

    //liquid silver can be used for free if it was also used one turn earlier
    let noFreeLiquidSilver = Status.getParticipantStatus(Settings.participants[Settings.localTurn], {"name":"liquidSilverFree"}) === false;
    if(!noFreeLiquidSilver)
        Settings.priorityThree = true;
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
        newSystemCall("Użycie umiejętności " + skill.name + " na wszystkich");
    }
    else if (target === "player" || target === "enemy"){
        participantsAffected = Settings.participants.filter(p => p.type === target);
        newSystemCall("Użycie umiejętności " + skill.name + " na wszyskich " + (target === "player" ? "graczy" : "przeciwników"));
    }
    else {
        if (!isNaN(target)) {
            //a single participant is the target of this skill
            participantsAffected.push(Settings.participants[target]);
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
                if(skill.statusTarget === "caster")
                    Status.applyStatus(Settings.participants[Settings.localTurn], structuredClone(status[0]));
                else Status.applyStatus(p, structuredClone(status[0]));
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

    //process the "permadeath" status
    let activeOnRestoreHpStatuses = Status.getParticipantsPersistentStatuses(target, "onRestoreHp");
    let permaDeath = false;
    if(activeOnRestoreHpStatuses.includes("permadeath")) {
        permaDeath = true;
    }

    //process the "shrapnel" status
    let healthToRestore = permaDeath ? 0 : applyShrapnel(obj[propertyName], target);

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
    let activeOnHealingStatuses = Status.getParticipantStatus(target, {"name": "shrapnel"});
    if(activeOnHealingStatuses !== false) {
        if(activeOnHealingStatuses.name === "shrapnel") {
            //shrapnel reduces healing by half
            return Math.floor(healing * 0.5);
        }
    }
    return healing;
}

export {act, filterBySubtype, restoreHp, damageTarget};
