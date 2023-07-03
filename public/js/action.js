import {endBattle, isBattleOver} from "./battle.js";
import {filterBySubtype} from "./list.js";
import {refreshCardsInBattle} from "./table.js";
import {Settings} from "./settings.js";
import {getRndInteger, handleSystemRoll, newSystemCall, randomSystemRoll} from "./utils.js";
import {StatsAffected, Status} from "./status.js";
import {Skill} from "./skill.js";
import {Spell} from "./spell.js";

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
            case "spell":
            case "skill":
            {
                if(actionElement !== '' && target !== '') {
                    let ability = [];
                    let cooldownRemaining = 0;
                    if(action === "spell") {
                        ability = Settings.spells.find(s => s.uspid === actionElementId);
                        cooldownRemaining = Settings.participants[Settings.localTurn].spellsOwned[actionElementId];
                    }
                    else {
                        ability = Settings.skills.find(s => s.usid === actionElementId);
                        cooldownRemaining = Settings.participants[Settings.localTurn].skillsOwned[actionElementId];
                    }
                    if (cooldownRemaining === 0) {
                        let priority = ability.priority;
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
                            handleUseSkillSpell(ability, target);
                        else newSystemCall("Ta akcja wymaga priorytetu " + priority + " który został już wykorzystany.");
                    }
                    else newSystemCall("To zaklęcie jeszcze się nie odnowiło!");
                }
                else newSystemCall("Nie wybrano celu bądź zaklęcia.");
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
    //Log the regular attack intent
    newSystemCall(attacker.name + " wykonuje zwykły atak w " + target.name + "!");

    //Players roll from 1-20, enemies from 1-100
    let participantType = attacker.type;
    let maxRoll = participantType === "enemy" ? "d100" : "d20";
    let hitCheck = handleSystemRoll(maxRoll);

    //Process the Blind, Focus and Perfection statuses
    hitCheck = applyBlindness(hitCheck);
    hitCheck = applyFocus(hitCheck);
    let perfectAttack = applyPerfection();

    //Calculate attack power after modifiers, such as criticals and half-attacks
    let attackPower = attacker.attack;
    let criticalWeakPoint = hitCheck === 100;
    let criticalHit = (participantType === "enemy" && hitCheck >= 90) || (participantType === "player" && hitCheck === 20);
    if(perfectAttack) {
        newSystemCall("Atak Perfekcyjny!");
    }
    else if (criticalWeakPoint) {
        attackPower *= 2;
        newSystemCall("Rzut systemu: " + hitCheck + " (Krytyczny Słaby Punkt)");
    }
    else if (criticalHit) {
        attackPower += participantType === "player" ? parseInt(attacker.level) : parseInt(attacker.zone);
        newSystemCall("Rzut systemu: " + hitCheck + " (Krytyczny Atak)");
    }
    else if (hitCheck > target.dodge) {
        newSystemCall("Rzut systemu: " + hitCheck + " (Trafienie)");
    }
    else if(hitCheck === target.dodge) {
        attackPower = Math.floor(attackPower / 2);
        newSystemCall("Rzut systemu: " + hitCheck + " (Atak Połowiczny)");
    }
    else {
        attackPower = 0;
        newSystemCall("Rzut systemu: " + hitCheck + " (Unik)");
    }

    //Process the Illusion, Impact and Deep Wounds statuses
    attackPower = applyIllusion(target, attackPower);
    attackPower = applyImpact(target, attackPower);
    attackPower = applyDeepWounds(target, attackPower);

    //If the target is dodging/blocking, reduce the damage by half
    if(target.isDodging)
        attackPower = Math.floor(attackPower / 2);

    //Reduce the attack by target's armor rating
    if(attackPower - target.armor >= 0)
        attackPower -= target.armor;
    else attackPower = 0;

    //Deal damage
    let targetHealth = target.health;
    if(targetHealth - attackPower > 0)
        target.health -= attackPower;
    else target.health = 0;

    //Process the "fury" status
    applyFury(target);

    //History system call
    if (attackPower > 0) newSystemCall(attacker.name + " zadaje " + attackPower + " obrażeń " + target.name + "!");

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
    //Find the item in the item list
    let item = Settings.items.find(i => i.uiid === itemId);
    //History system call
    newSystemCall("Użycie " + item.displayName + " na " + target.name);
    //See if the target is dead or alive
    let targetAlive = target.health > 0;
    //Use the healing item
    if(targetAlive && item.subtype === "restore") restoreHp(item, target);
    else if (!targetAlive && item.subtype === "revive") restoreHp(item, target);
    else if (targetAlive && item.type === "statusRemover") {
        //Remove all clearable statuses of the target
        Status.voidParticipantStatuses(target);
    }
    else if(item.type === "special") {
        //First multiply the attack by 3
        target.attack *= 3;
        //Randomise two targets - one must be of reverse type to us
        let reverseType = target.type === "player" ? "enemy" : "player";
        let firstTargetArray = Settings.participants.filter(p => p.type === reverseType);
        let firstTarget = firstTargetArray[randomSystemRoll(firstTargetArray.length)-1];
        let secondTarget = Settings.participants[randomSystemRoll(Settings.participants.length)-1];
        //Attack the two targets
        handleRegAttack(firstTarget, target);
        handleRegAttack(secondTarget, target);
        //Stun the target of the potion
        Status.applyStatus(target, Settings.statuses.filter(s => s.name === "stun")[0]);
        //Bring the attack back to the original number
        target.attack /= 3;
    }
    else {
        itemUsed = false;
        newSystemCall("Nie udało się użyć tego przedmiotu na wskazanym celu.");
    }

    //Apply statuses of the item
    if (targetAlive) {
        if(Object.keys(item.statusesApplied || {}).length > 0) {
            for(let s of item.statusesApplied) {
                let status = s;
                let statusReady = (typeof s) === "object";
                if(!statusReady) {
                    //Fetch the full status based on the name
                    status = Settings.statuses.filter(st => st.name === s);
                }
                Status.applyStatus(target, structuredClone(status[0]));
            }
        }
    }

    //Reduce participant's item count
    if(itemUsed) {
        Settings.participants[Settings.localTurn].itemsOwned[itemId] -= 1;
        Settings.priorityThree = false;
    }

    //Liquid silver can be used for free if it was also used one turn earlier
    let noFreeLiquidSilver = Status.getParticipantStatus(Settings.participants[Settings.localTurn], {"name":"liquidSilverFree"}) === false;
    if(!noFreeLiquidSilver)
        Settings.priorityThree = true;
}

/**
 * This function takes a skill or a spell and a target to use the skill or spell on that target
 * For the ease of development, a Skill or a Spell is names "ability" - its type is established later
 *
 * @function handleUseSkillSpell
 * @param {Skill|Spell} ability The skill or spell to use
 * @param {string|int} target A group or an individual participant to target
 * @return void
 */
function handleUseSkillSpell(ability, target)
{
    //Set variables for useful ability properties
    let type = ability.type;
    let subtype = ability.subtype;
    let abilityType = Object.hasOwn(ability, "uspid") ? "spell" : "skill";
    let casterType = Settings.participants[Settings.localTurn].type;

    //Based on the target, generate the target(s) array
    let participantsAffected = [];
    if (target === "everyone") {
        participantsAffected = Settings.participants;
        newSystemCall("Użycie " + (abilityType === "spell" ? "zaklęcia " : "umiejętności ") + ability.name + " na wszystkich");
    }
    else if (target === "player" || target === "enemy") {
        participantsAffected = Settings.participants.filter(p => p.type === target);
        newSystemCall("Użycie " + (abilityType === "spell" ? "zaklęcia " : "umiejętności ") + ability.name + " na wszyskich " + (target === "player" ? "graczy" : "przeciwników"));
    }
    else if (!isNaN(target)) {
        //A single participant is the target of this ability
        participantsAffected.push(Settings.participants[target]);
        newSystemCall("Użycie " + (abilityType === "spell" ? "zaklęcia " : "umiejętności ") + ability.name + " na " + Settings.participants[target].name);
    }

    //Only include dead or alive participants based on the subtype of the ability
    participantsAffected = filterBySubtype(participantsAffected, subtype);

    //Make a roll for the ability
    let maxRollValue = casterType === "player" ? 'd20' : (type === "offensive" ? 'd100' : 'd20');
    let hitRoll = handleSystemRoll(maxRollValue);

    //Process the Blind, Focus and Perfection statuses
    hitRoll = applyBlindness(hitRoll);
    hitRoll = applyFocus(hitRoll);
    let perfectAttack = applyPerfection();

    //Establish whether the ability hits the target(s)
    let hitsArray = [];
    let spellHitSuccess = false;
    let hitMarkSuccess = false;
    if(ability.hitMark === "default") {
        if(abilityType === "spell") {
            //By default, spells hit if the d20 roll is 11 or greater no matter the target
            if(hitRoll >= 11)
                spellHitSuccess = true;
        }
        else if(abilityType === "skill") {
            //For skills, you roll one time and compare against each target later
            for(let i = 0; i < participantsAffected.length; ++i) {
                //Fill the hitsArray with the value of the roll
                hitsArray.push(hitRoll);
            }
        }
    }
    else if(hitRoll >= ability.hitMark) {
        //If it is not set to default, compare against the specific mark - for now only numbers are accepted
        hitMarkSuccess = true;
    }

    //Apply the effects only if the ability hits
    if((abilityType === "spell" && spellHitSuccess) || hitMarkSuccess || perfectAttack || (abilityType === "skill" && hitsArray.length === participantsAffected.length)) {

        //Critical hits double or increase the power of the ability, check if they happened
        let criticalWeakPoint = casterType === "enemy" ? hitRoll === 100 : false;
        let criticalHit = casterType === "player" ? hitRoll === 20 : hitRoll >= 90;

        //Use the ability on each target
        let i = 0;
        for (let p of participantsAffected) {
            //Clone the ability to apply modifiers on per-target basis
            let abilityPreModifiers = structuredClone(ability);

            //Process the "illusion" status
            abilityPreModifiers.value = applyIllusion(p, abilityPreModifiers.value);
            let illusionApplied = abilityPreModifiers.value !== ability.value;

            //Compare with the target's dodge whether the hit is critical, full or partial
            let applyStatuses = false;
            if(perfectAttack) {
                applyStatuses = true;
                newSystemCall("Atak Perfekcyjny!");
            }
            else if(criticalWeakPoint) {
                abilityPreModifiers.value *= 2;
                applyStatuses = true;
                newSystemCall("Rzut systemu: " + hitRoll + " (Krytyczny Słaby Punkt)");
            }
            else if (criticalHit) {
                abilityPreModifiers.value += casterType === "player" ? Settings.participants[Settings.localTurn].level : Settings.participants[Settings.localTurn].zone;
                applyStatuses = true;
                newSystemCall("Rzut systemu: " + hitRoll + " (Krytyczny Sukces)");
            }
            else if ((abilityType === "spell" && spellHitSuccess) || hitMarkSuccess) {
                applyStatuses = true;
                newSystemCall("Rzut systemu: " + hitRoll + " (Sukces)");
            }
            else if (abilityType === "skill" && type === "offensive" && hitsArray[i] > p.dodge)
            {
                applyStatuses = true;
                newSystemCall("Rzut systemu: " + hitsArray[i] + " (Trafienie)");
            }
            else if (abilityType === "skill" && type === "offensive" && hitsArray[i] === p.dodge)
            {
                applyStatuses = true;
                abilityPreModifiers.value = Math.floor(abilityPreModifiers.value / 2);
                newSystemCall("Rzut systemu: " + hitsArray[i] + " (Atak Połowiczny)");
            }
            else if (abilityType === "skill" && type === "healing" && hitsArray[i] >= 10) {
                applyStatuses = true;
                newSystemCall("Rzut systemu: " + hitsArray[i] + " (Sukces)");
            }
            else {
                abilityPreModifiers.value = 0;
                newSystemCall("Rzut systemu: " + hitRoll + " (Chybienie)");
            }

            //Process the Impact and Deep Wounds statuses
            abilityPreModifiers.value = applyImpact(p, abilityPreModifiers.value);
            abilityPreModifiers.value = applyDeepWounds(p, abilityPreModifiers.value);

            //Check if the target is dodging an attack - avoid half the damage
            if(p.isDodging && type === "offensive")
                abilityPreModifiers.value = Math.floor(abilityPreModifiers.value / 2);

            //Reduce the ability's power by target's armor rating if it is a skill and not a spell
            if(abilityType === "skill" && type === "offensive") {
                if(abilityPreModifiers.value - p.armor >= 0)
                    abilityPreModifiers.value -= p.armor;
                else abilityPreModifiers.value = 0;
            }

            //Finally, restore hp or deal damage (if non-zero)
            if(abilityPreModifiers.value > 0) {
                if (type === "healing")
                    restoreHp(abilityPreModifiers, p);
                else if (type === "offensive")
                    damageTarget(abilityPreModifiers, p);
            }

            //Process the "fury" status
            applyFury(p);

            //Apply statuses of the ability if it hit or succeeded and no illusion applied
            if(applyStatuses && !illusionApplied && Object.keys(ability.statusesApplied || {}).length > 0) {
                for(let s of ability.statusesApplied) {
                    let status = s;
                    let statusReady = (typeof s) === "object";
                    if(!statusReady) {
                        //Fetch the full status based on the name
                        status = Settings.statuses.filter(st => st.name === s);
                    }
                    if(ability.statusTarget === "caster")
                        Status.applyStatus(Settings.participants[Settings.localTurn], structuredClone(status[0]));
                    else Status.applyStatus(p, structuredClone(status[0]));
                }
            }

            //Increase the iterator and go to the next target of the ability...
            i++;
        }
    }
    else
        newSystemCall("Rzut systemu: " + hitRoll + " (Chybienie)");

    //Set the ability on cooldown
    if(Object.hasOwn(ability, "uspid"))
        Settings.participants[Settings.localTurn].spellsOwned[ability.uspid] = ability.cooldown;
    else
        Settings.participants[Settings.localTurn].skillsOwned[ability.usid] = ability.cooldown;
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
 * This function heals a given target - it deduces the power of the healing effect
 * from the object passed to it and calculates the final value of the effect
 *
 * @function restoreHp
 * @param {Object} healingSource The Item, Status, Skill or Spell object used when restoring hp
 * @param {Participant} healTarget participant receiving hp
 * @return {number} the amount of health restored
 */
function restoreHp(healingSource, healTarget)
{
    //Statuses use property strength instead of value
    let statusObject = Object.hasOwn(healingSource, "strength");
    let propertyName = statusObject ? "strength" : "value";
    let typePropertyName = statusObject ? "strengthType" : "valueType";

    //Store the health of the target before the health is restored
    let startingHealth = healTarget.health;

    //Process the "permadeath" status
    let permaDeath = applyPermadeath(healTarget);
    if(startingHealth === 0 && permaDeath)
        return 0;

    //Process the "shrapnel" status
    let healthToRestore = applyShrapnel(healingSource[propertyName], healTarget);

    if(healingSource[typePropertyName] === "flat"){
        if(healTarget.health + healthToRestore > healTarget.maxHealth)
            healTarget.health = healTarget.maxHealth;
        else healTarget.health += healthToRestore;
    }
    else {
        if(healTarget.health + (healTarget.maxHealth * healthToRestore) > healTarget.maxHealth)
            healTarget.health = healTarget.maxHealth;
        else healTarget.health += (healTarget.maxHealth * healthToRestore);
    }

    return healTarget.health - startingHealth;
}

/**
 * This function damages a given target - it deduces the power of the attack from the
 * object passed to it and calculates the final value of such attack
 *
 * @function damageTarget
 * @param {Object} attackSource The Item, Status, Skill or Spell object used when attacking
 * @param {Participant} attackTarget participant losing hp
 * @return {number} the amount of damage dealt
 */
function damageTarget(attackSource, attackTarget)
{
    //Statuses use property strength instead of value
    let statusObject = Object.hasOwn(attackSource, "strength");
    let propertyName = statusObject ? "strength" : "value";
    let typePropertyName = statusObject ? "strengthType" : "valueType";

    let startingHealth = attackTarget.health;
    let attackPower = parseInt(attackSource[propertyName]);

    //Damages participant by a flat value
    if (attackSource[typePropertyName] === "flat") {
        if(attackTarget.health - attackPower > 0)
            attackTarget.health -= attackPower;
        else attackTarget.health = 0;
    }
    else {
        //Damages participant by a % of their max hp
        if(attackTarget.health - (attackTarget.maxHealth * attackPower) > 0)
            attackTarget.health -= (attackTarget.maxHealth * attackPower);
        else attackTarget.health = 0;
    }

    return startingHealth - attackTarget.health;
}

/**
 * Utility function that calculates the damage of an Impact-affected attack
 * It also advances the status if it was applied to the attack
 *
 * @function applyImpact
 * @param {int} abilityPower the damage to apply impact to
 * @param {Participant} attackTarget the target of the attack
 * @returns {int} damage with impact applied
 */
function applyImpact(attackTarget, abilityPower) {
    let damageTotal = abilityPower;
    let activeOnDamageStatuses = Status.getParticipantsPersistentStatuses(Settings.participants[Settings.localTurn], "onDamage");
    if(activeOnDamageStatuses.includes("impact")) {
        //Impact status may double or quadruple damage
        let impactMultiplier = 1;
        if (Settings.participants[Settings.localTurn].health <= Settings.participants[Settings.localTurn].maxHealth * 0.5) {
            impactMultiplier *= 2;
        }
        if (attackTarget.health <= attackTarget.maxHealth * 0.5) {
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
 *
 * @function applyShrapnel
 * @param {int} healingPower the value of the healing effect
 * @param {Participant} healTarget the target participant object of the healing effect
 * @returns {int} the post-shrapnel value of the healing effect
 */
function applyShrapnel(healingPower, healTarget) {
    let activeOnHealingStatuses = Status.getParticipantStatus(healTarget, {"name": "shrapnel"});
    if(activeOnHealingStatuses !== false) {
        if(activeOnHealingStatuses.name === "shrapnel") {
            //Shrapnel reduces healing by half
            return Math.floor(healingPower * 0.5);
        }
    }
    return healingPower;
}

/**
 * This function takes an attack roll and applies the Blindness status if it is present
 *
 * @function applyBlindness
 * @param {number} attackRoll The roll to apply the status to
 * @returns {number} The roll after the application of the status
 */
function applyBlindness(attackRoll) {
    let activeOnHitStatuses = Status.getParticipantsPersistentStatuses(Settings.participants[Settings.localTurn], "onHit");
    if(activeOnHitStatuses.includes("blind")) {
        //Blindness reduces the participant's hit chance by D4+1
        let reduction = randomSystemRoll(4)+1;
        attackRoll = (attackRoll - reduction) < 0 ? 0 : (attackRoll - reduction);
    }
    return attackRoll;
}

/**
 * This function takes an attack roll and applies the Focus status if it is present
 *
 * @function applyFocus
 * @param {number} attackRoll The roll to apply the status to
 * @returns {number} The roll after the application of the status
 */
function applyFocus(attackRoll) {
    let activeOnHitStatuses = Status.getParticipantsPersistentStatuses(Settings.participants[Settings.localTurn], "onHit");
    if(activeOnHitStatuses.includes("focus")) {
        //Focus increases the participant's hit chance by 5
        attackRoll = attackRoll + 5 > 20 ? 20 : (attackRoll + 5);
    }
    return attackRoll;
}

/**
 * This function checks if the perfection status is applied
 *
 * @function applyPerfection
 * @returns {boolean} true if applied, false otherwise
 */
function applyPerfection() {
    let activeOnHitStatuses = Status.getParticipantsPersistentStatuses(Settings.participants[Settings.localTurn], "onHit");
    let perfectAttack = false;
    if(activeOnHitStatuses.includes("perfection")) {
        //Perfection status makes an attack always hit
        perfectAttack = true;
        Status.advancePersistentStatus(Settings.participants[Settings.localTurn], "perfection");
    }
    return perfectAttack;
}

/**
 * Illusion status works in two ways, both are checked by this function:
 * - If we attack someone with the status, our attack "goes through" them, unless they attacked us before
 * - If we have the status and attack someone, they can now attack us too
 *
 * @function applyIllusion
 * @param {Participant} attackTarget the participant object who was attacked
 * @param {number} abilityPower the power of the attack
 * @returns {number} The attack power as provided or 0 if the status was applied
 */
function applyIllusion(attackTarget, abilityPower) {
    //First check if the target has the Illusion status and whether they attacked us before
    let activeTargetStatuses = Status.getParticipantsPersistentStatuses(attackTarget, "onHit");
    if(activeTargetStatuses.includes("illusion") && Settings.participants[Settings.localTurn].type !== attackTarget.type) {
        //Fetch the status
        let illusionStatus = attackTarget.statusesApplied.filter(s => s.name === "illusion")[0];
        //Illusion requires the target to have attacked the attacked first
        if(illusionStatus.hasOwnProperty("linkedTargetsList")) {
            if(!illusionStatus.linkedTargetsList.includes(Settings.localTurn)) {
                //If the target is not in the list, the attack "goes through them"
                abilityPower = 0;
            }
        }
    }
    //If we have the status and attack someone, that someone must be added to the list
    let activeOnHitStatuses = Status.getParticipantsPersistentStatuses(Settings.participants[Settings.localTurn], "onHit");
    if(activeOnHitStatuses.includes("illusion") && abilityPower > 0 && Settings.participants[Settings.localTurn] !== attackTarget.type) {
        //Fetch the status
        let illusionStatus = Settings.participants[Settings.localTurn].statusesApplied.filter(s => s.name === "illusion")[0];
        let targetParticipantNo = Settings.participants.indexOf(Settings.participants.filter(part => part.name === attackTarget.name)[0]);
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
    return abilityPower;
}

/**
 * The Deep Wounds status increases the damage dealt to us by an incoming attack
 *
 * @function applyDeepWounds
 * @param {Participant} attackTarget The participant object, target of the attack
 * @param {number} abilityPower Power of the incoming attack
 * @returns {number} The power after increase
 */
function applyDeepWounds(attackTarget, abilityPower) {
    let activeOnDamageStatuses = Status.getParticipantsPersistentStatuses(attackTarget, "onDamage");
    if(activeOnDamageStatuses.includes("deepWounds")) {
        //Only increase the damage of the attack if it actually hits
        if(abilityPower > 0) {
            let deepWoundsStatus = attackTarget.statusesApplied.filter(s => s.name === "deepWounds")[0];
            abilityPower += deepWoundsStatus.strength;
            Status.advancePersistentStatus(attackTarget, "deepWounds");
        }
    }
    return abilityPower;
}

/**
 * The Fury status may trigger only when a participant dies so this
 * function is invoked after each attack on any participant
 *
 * @function applyFury
 * @param {Participant} attackTarget The target Participant object who suffered an attack
 */
function applyFury(attackTarget) {
    //Process the "fury" status
    if(attackTarget.health === 0) {
        //See if there remains only 1 alive participant in the target's team
        let aliveTargetTypeParticipantsArr = Settings.participants.filter(p => p.type === attackTarget.type && p.health > 0);
        if(aliveTargetTypeParticipantsArr.length === 1) {
            //See if the participant is affected by the "fury" status
            let activeOnDeathStatuses = Status.getParticipantsPersistentStatuses(aliveTargetTypeParticipantsArr[0], "onDeath");
            if(activeOnDeathStatuses.includes("fury")) {
                //Fury restores hp
                let furyStatusFound = aliveTargetTypeParticipantsArr[0].statusesApplied.filter(s => s.name === "fury")[0];
                let tHp = aliveTargetTypeParticipantsArr[0].health;
                let mHp = aliveTargetTypeParticipantsArr[0].maxHealth;
                aliveTargetTypeParticipantsArr[0].health = tHp + furyStatusFound.strength > mHp ? mHp : tHp + furyStatusFound.strength;
                //Update the status to a global status - this way the effect of the stat mod will wear off after the desired number of turns
                furyStatusFound.effectiveTurn = "global";
                furyStatusFound.effectiveAt = "end";
                StatsAffected.applyStatusStatModifiers(aliveTargetTypeParticipantsArr[0], furyStatusFound);
            }
        }
    }
}

/**
 * Returns true if the target of the healing effect has the Permadeath status, false otherwise
 *
 * @function applyPermadeath
 * @param {Participant} healTarget the target participant object of the healing effect
 * @returns {boolean} true if the status is present, false otherwise
 */
function applyPermadeath(healTarget) {
    let activeOnRestoreHpStatuses = Status.getParticipantsPersistentStatuses(healTarget, "onRestoreHp");
    return !!activeOnRestoreHpStatuses.includes("permadeath");
}

export {act, filterBySubtype, restoreHp, damageTarget};
