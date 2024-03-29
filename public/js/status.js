import {newSystemCall, randomSystemRoll} from "./utils.js";
import {Settings} from "./settings.js";
import {damageTarget, restoreHp} from "./action.js";
import {Participant} from "./participant.js";

/**
 * @typedef {Object} Status
 *
 * The Status class handles all interactions between the participants and status effects.
 * A status effect is an effect, or an interaction, that takes place without having to directly interact with it.
 * Once the status is applied, the participant simply goes on with their activities in the battle.
 *
 * Currently, there are 6 types of status effects: "restore", "damage", "statModifier", "debuff", "buff" and "transitional".
 * Statuses of type "damage" deal damage to the participant affected by them.
 * Statuses of type "restore" heal the participants affected by them.
 * Statuses of type "statModifier" change the statistics of the participant (strength, speed etc.)
 * Statuses of type "debuff" disadvantage the participant in some other way, ex. making them unable to attack
 * Statuses of type "buff" provide some advantage to the participant, ex. raise their hit chance during an attack
 * The final type, "transitional", is used to transition between one status and another, or to allow more complex interactions.
 *
 * Each status activates ("procs") at some point in the turn. This is defined by the "effectiveTurn" property.
 * There are currently 3 options: local, global and persistent.
 * A "local" proc will activate during the participant's local turn, either at the start, or the end.
 * A "global" proc will activate at the end of the global turn (all participant's turn has passed).
 * A "persistent" status has a limited number of uses and can activate at any time of the battle.
 * Each proc reduces the remaining length of the status by 1. Once it reaches 0, the status ends.
 *
 * The last crucial element is the status' "effectiveAt" property. This property dictates the exact moment the status effect activates.
 * If we just limited the status effects to proc at local or global turns, their capabilities would be very limited.
 * This property allows the user to define a precise moment in the flow of the battle to set the status at.
 * Currently, the following options are available: "onAct", "onDamage", "onHit", "onRestoreHp", "onDeath", "onStartTurn", "onApplyStatus", "onEscape".
 * We call these options "listeners", since they patiently wait and listen for a participant who is affected by them to act.
 * The "onAct" listener triggers as soon as the participant makes an action, to ex. stop it.
 * The "onDamage" listener triggers when damage is dealt to a participant, to ex. increase it.
 * The "onHit" listener triggers when an attack is made, to ex. reduce the hit chance.
 * The "onRestoreHp" listener triggers when the target is healed, to ex. reduce the value of the heal.
 * The "onDeath" listener triggers when a participant dies, to ex. grant a boon to their ally.
 * The "onStartTurn" listener triggers as soon as any turn starts, to ex. skip the turn.
 * The "onApplyStatus" listener triggers the moment any status effect is applied, to ex. nullify it.
 * The "onEscape" listener triggers the moment the participant attempts to escape the battle, to ex. increase his chances
 * As you can see, these listeners pinpoint an exact moment in the flow of the battle to make it more dynamic and real.
 * There are two options limited to the "local" "effectiveTurn" procs, and these are "start" and "end".
 * The "start" will proc at the start of the local turn of the participant.
 * The "end" will proc at the end of the local turn of the participant.
 *
 * The final thing to note is the "persistent" status and it's limited number of uses.
 * Sometimes we want a status to proc no more than 3 times. To do this, we use a persistent status and specify the length to 3.
 * Then we set the moment the status procs, so the "effectiveAt" property, to one of our choice.
 * It's important to note that the "effectiveAt" property is used to help you and the programmer differentiate between statuses.
 * The actual "persistent" status must be implemented and tested separately, however, it will be set at the given "effectiveAt" moment.
 * For local and global statuses, this is not required - their behaviour is fully automated and no custom programming is required.
 *
 * "statsAffectedList" is used for statuses of type "statModifier" - the actual StatsAffected object is stored here for reference.
 *
 * "linkedTargetsList" is a special property used by statuses that need to keep a list of participants to work properly, for any reason.
 * This behaviour must be programmed separately each time it is required, but for reference, see the "illusion" status.
 *
 * "useDefaultStrengthSource" is used for statuses that change their strength over time, ex. it depends on the level of the player.
 * This behaviour is quite common. If this property is set to true, no strength is required - participant's "level" or "zone" will be used automatically.
 *
 * "applyStatsAffectedImmediately" will not apply stat modifiers once the status is applied. They must be programmed into the status implementation later.
 * For reference, see the "fury" status, that is present on the participant, but only gives them a boon when other participants are downed.
 *
 * Status effects are the most complex part of the system and the following properties make them possible:
 * @property {string} ustid - unique status id, generated by MongoDb
 * @property {string} name - internal name of the status (to find it in the list of all statuses)
 * @property {string} displayName - the name of the status seen by the user
 * @property {string} description - the description of the status effect seen by the user
 * @property {string} effectiveAt - whether the status is applied as the start or end of the local turn (start/end) or at the given listener (see above)
 * @property {string} effectiveTurn - whether the status is applied at the local, global or throughout the turn (local/global/persistent)
 * @property {string} type - status type (restore/damage/statModifier/debuff/buff/transitional - see above for the description)
 * @property {string} strengthType - the strength can be "flat" or "percentage" (10 damage vs. 10% of the hp)
 * @property {number} randomisedLength - if length in turn is to be randomised, put the max length here
 * @property {number} defaultLength - if length is not specified, the defaultLength will be used, 0 will use randomisedLength
 * @property {number} length - how many turns the status will last, if 0 is used, defaultLength will be used
 * @property {number} defaultStrength - if strength is not specified, the defaultStrength will be used
 * @property {number} strength - how strong the status is, ex. 5/10/25 (damage/healing etc.)
 * @property {array} statsAffectedList - list of StatsAffected objects that list which statistics were affected and by how much
 * @property {array} linkedTargetsList - list of participants linked to the status effect
 * @property {boolean} statusClearable - true if the status can be voided by in-game actions, false otherwise
 * @property {boolean} lastUntilCleared - true if the status lasts indefinitely (until cleared), false otherwise
 * @property {boolean} useDefaultStrengthSource - true to use a default stat to take strength from (level/zone), false otherwise
 * @property {boolean} applyStatsAffectedImmediately - some statuses delay the application of stat modifiers, ex. fury, true otherwise.
 */
class Status {
    //class constructor
    constructor(ustid) {
        this.ustid = ustid;
    }
    //class properties
    ustid = "";
    name = "";
    displayName = "";
    description = "";
    effectiveAt = "";
    effectiveTurn = "";
    type = "";
    strengthType = "";
    randomisedLength = 0;
    defaultLength = 0;
    length = 0;
    defaultStrength = 0;
    strength = 0;
    statsAffectedList = [];
    linkedTargetsList = [];
    statusClearable = false;
    lastUntilCleared = false;
    useDefaultStrengthSource = false;
    applyStatsAffectedImmediately = true;

    /**
     * This function takes a status and checks if it is valid. Prints an error message to the history box if invalid.
     *
     * @function validate
     * @param {Object} status a status object to validate
     * @returns {boolean} true if the status is valid, false otherwise
     */
    static validate(status) {
        //define a string to store the error message
        let errorMessage = "";

        //first check the length is specified (or lasts until cleared)
        let lengthOK = status.length > 0 || status.lastUntilCleared;
        //if length is not defined, check if defaultLength or randomisedLength is defined
        if(!lengthOK) {
            let defaultLengthOK = status.defaultLength > 0;
            let randomisedLengthOK = status.randomisedLength > 0;
            if(!defaultLengthOK && !randomisedLengthOK) {
                errorMessage += "W: Nie podano czasu trwania statusu\n";
            }
        }

        //name, displayName and description must all be defined
        let nameOK = (typeof status.name === 'string') && status.name.length > 0;
        let displayNameOK = (typeof status.displayName === 'string') && status.displayName.length > 0;
        let descriptionOK = (typeof status.description === 'string') && status.description.length > 0;
        if(!nameOK || !displayNameOK || !descriptionOK) {
            if(!nameOK) errorMessage += "W: Nie podano wewnętrznej nazwy statusu\n";
            if(!displayNameOK) errorMessage += "W: Nie podano wyświetlanej nazwy statusu\n";
            if(!descriptionOK) errorMessage += "W: Nie podano opisu statusu\n";
        }

        //effectiveAt, effectiveTurn and type must be specified and have one of the pre-defined values
        let effectiveTurnOK = (typeof status.effectiveTurn === 'string') && ["local", "global", "persistent"].includes(status.effectiveTurn);
        let typeOK = (typeof status.type === 'string') && ["restore", "damage", "statModifier", "debuff", "buff", "transitional"].includes(status.type);
        let effectiveAtOK = false;
        if(effectiveTurnOK) {
            //global turns do not require effectiveAt, local must be "start" or "end", persistent can use any listener for now
            let effAt = status.effectiveAt;
            let effTurn = status.effectiveTurn;
            //effTurn === "persistent" ? ["onAct", "onDamage", "onHit", "onRestoreHp", "onDeath", "onStartTurn", "onApplyStatus", "onEscape"]
            let allowedLocalValues = ["start", "end"];
            effectiveAtOK = effTurn === "global" || effTurn === "persistent" ? true : ((typeof effTurn === 'string') && allowedLocalValues.includes(effAt));
        }
        if(!effectiveAtOK || !effectiveTurnOK || !typeOK) {
            if(!effectiveAtOK) errorMessage += "W: Podano niepoprawny momentu działania statusu w kolejce\n";
            if(!effectiveTurnOK) errorMessage += "W: Podano niepoprawny moment zmniejszania czasu działania statusu w kolejce\n";
            if(!typeOK) errorMessage += "W: Podano niepoprawny typ statusu\n";
        }

        //strength must be defined for statuses of type "damage" and "restore"
        if(typeOK) {
            let strengthRequired = status.type === "damage" || status.type === "restore";
            let strengthOK = strengthRequired ? (status.strength > 0 || status.useDefaultStrengthSource) : true;
            if(!strengthOK) {
                //default strength must be defined, otherwise the status is invalid
                if(status.defaultStrength < 1) {
                    errorMessage += "W: Nie podano siły statusu\n";
                }
            }
        }
        else errorMessage += "W: Nie zmierzono siły statusu z uwagi na niepoprawny typ\n";

        //statsAffectedList must match the specification of the object, so the object's validation method is used
        status.statsAffectedList = typeof status.statsAffectedList == "undefined" ? [] : status.statsAffectedList;
        let statsAffectedListOK = true;
        for(let i = 0; i < status.statsAffectedList.length; ++i) {
            let statsAffectedListElementOK = StatsAffected.validate(status.statsAffectedList[i]);
            statsAffectedListOK = statsAffectedListElementOK === true ? statsAffectedListOK : false;
            if(!statsAffectedListElementOK) errorMessage += "W: Wskazana zmiana statystyk nr. "+i+" przez status jest niepoprawna\n";
        }
        if(!statsAffectedListOK) {
            errorMessage += "W: Wskazane zmiany statystyk przez status są niepoprawne\n";
        }

        //if there is no error message, the status is valid
        if(errorMessage === "")
            return true;
        else {
            //print the error message
            newSystemCall(errorMessage);
            return false;
        }
    }

    /**
     * This function returns the matching status of a participant, or false if not found
     *
     * @function getParticipantStatus
     * @param {object} participant the participant to check
     * @param {object} status the status to check
     * @returns {boolean|*} status if found, false otherwise
     */
    static getParticipantStatus(participant, status) {
        let statusList = participant.statusesApplied;
        if (statusList.length === 0) return false;
        else {
            //for every status the player is affected by, compare it
            for(let i = 0; i < statusList.length; ++i) {
                if(statusList[i].name === status.name) return statusList[i];
            }
        }
        //if the status is not found, return false
        return false;
    }

    /**
     * This function takes a participant and returns an array that contains
     * their persistent statuses effective at the particular listener given
     *
     * @param {object} participant the participant to get statuses from
     * @param {string} listener the effectiveAt of the persistent status, ex. "onAct"
     * @returns {array} an array with the statuses found
     */
    static getParticipantsPersistentStatuses(participant, listener) {
        let statusList = Object.hasOwn(participant, "statusesApplied") ? participant.statusesApplied : [];
        if (statusList.length === 0) return [];
        else return statusList.filter(s => s.effectiveAt === listener).map(s => s.name);
    }

    /**
     * This function checks whether the given participant is already affected by the given status
     *
     * @function isParticipantAffected
     * @param {object} participant the participant to check
     * @param {object} status the status to check
     * @returns {boolean} true if affected, false otherwise
     */
    static isParticipantAffected(participant, status) {
        let result = this.getParticipantStatus(participant, status);
        if (result === false) return false;
        else return result.name === status.name;
    }

    /**
     * This function takes two statues and compares their "power". The stronger status is returned.
     *
     * @function compareStatusPower
     * @param {object} currentStatus the first (currently applied) status to compare
     * @param {object} newStatus the second (replacing the current) status to compare
     * @returns {object}
     */
    static compareStatusPower(currentStatus, newStatus) {
        //to calculate the "objective" status power, we'll multiply the strength by the length
        let firstStatusPower = currentStatus.strength * currentStatus.length;
        let secondStatusPower = newStatus.strength * newStatus.length;
        //if the values are the same, assume the user wanted the replacement and return the new status
        return firstStatusPower > secondStatusPower ? currentStatus : (firstStatusPower === secondStatusPower ? newStatus : newStatus);
    }

    /**
     * This function checks if length and strength are defined and if not, it applies the default values
     *
     * @function applyDefaultValues
     * @param {object} status the status to apply the values to
     * @returns {object} the status, after update
     */
    static applyDefaultValues(status) {
        //First check the length is specified
        let lengthDefined = status.length > 0 || status.lastUntilCleared;
        if(!lengthDefined) {
            let defaultLengthDef = status.defaultLength > 0;
            if(!defaultLengthDef) {
                status.length = randomSystemRoll(status.randomisedLength);
            }
            else status.length = status.defaultLength;
        }
        //Then check if strength is defined
        let strengthDefined = status.strength > 0;
        if(!strengthDefined) {
            //If not, check if default strength source is to be used
            let useDefaultStrengthSource = status.useDefaultStrengthSource;
            if(useDefaultStrengthSource) {
                //Use the default strength source
                let pType = Participant.getCurrentlyActingParticipant().type;
                let defaultStrSrc = pType === "player" ? "level" : "zone";
                status.strength = Participant.getCurrentlyActingParticipant()[defaultStrSrc];
            } //Else use default strength
            else status.strength = status.defaultStrength;
        }
        //Return the updated status
        return status;
    }

    /**
     * This function takes an existing status, drops it and inserts a replacement
     *
     * @function replaceParticipantStatus
     * @param {object} participant the participant who "owns" the status
     * @param {object} statusToReplace the status to drop
     * @param {object} replacementStatus the status to insert
     */
    static replaceParticipantStatus(participant, statusToReplace, replacementStatus) {
        this.voidStatus(participant, statusToReplace);
        participant.statusesApplied.push(replacementStatus);
    }

    /**
     * This function takes a participant and voids the given status and all its modifiers
     *
     * @function voidStatus
     * @param {object} participant the participant who is affected by the status
     * @param {object} statusToVoid the status to find and void
     */
    static voidStatus(participant, statusToVoid) {
        let participantStatuses = participant.statusesApplied;
        let inArrayStatusToVoid = participantStatuses.filter(ps => ps.name === statusToVoid.name);
        let statusPosition = participantStatuses.indexOf(inArrayStatusToVoid[0]);
        if(statusPosition >= 0) {
            //If the status had any stat modifiers, these must be cancelled first
            StatsAffected.cancelStatModifiers(participant, participantStatuses[statusPosition]);
            participantStatuses.splice(statusPosition, 1);
        }
    }

    /**
     * This function voids all clearable statuses of a participant
     * Used mostly on death or use of the Cleansing Potion item
     *
     * @function voidParticipantStatuses
     * @param {object} participant the participant whom statuses will be voided
     */
    static voidParticipantStatuses(participant) {
        let participantStatuses = participant.statusesApplied;
        for (let i = participantStatuses.length-1; i >= 0; --i) {
            //Find only the statuses that can be cleared
            if (participantStatuses[i].statusClearable === true) {
                //Void them
                newSystemCall("Uczestnik " + participant.name + " nie jest już celem statusu " + participantStatuses[i].displayName);
                this.voidStatus(participant, participantStatuses[i]);
            }
        }
    }

    /**
     * This function takes a participant and a status, and then applies the status on the participant
     *
     * @function applyStatus
     * @param {object} participant the target of the status
     * @param {object} status the status to apply
     */
    static applyStatus(participant, status) {
        //Before you apply the status, validate it
        let statusValid = Status.validate(status);
        if (!statusValid) return;
        //Check if the target is protected against statuses
        let activeOnApplyStatusStatuses = Status.getParticipantsPersistentStatuses(participant, "onApplyStatus");
        if(activeOnApplyStatusStatuses.includes("statusResistance")) return;
        //Apply defaultLength and defaultStrength where required
        let statusUpdated = Status.applyDefaultValues(status);
        //If the status is valid, check that the participant is not already affected by it
        let participantAlreadyAffected = Status.isParticipantAffected(participant, statusUpdated);
        if(participantAlreadyAffected) {
            //If the participant is already affected, fetch the participant's version of the status
            let participantAffectedBy = Status.getParticipantStatus(participant, statusUpdated);
            //Check which status is stronger by comparing their strengths and lengths
            let strongerStatus = Status.compareStatusPower(participantAffectedBy, statusUpdated);
            //Replace the previous status with the new status if it is stronger
            if(statusUpdated === strongerStatus) {
                //Apply the status and any stat modifiers
                Status.replaceParticipantStatus(participant, statusUpdated, strongerStatus);
                if(strongerStatus.applyStatsAffectedImmediately === true)
                    StatsAffected.applyStatusStatModifiers(participant, strongerStatus);
            }
        }
        else {
            //Apply the status and any stat modifiers
            participant.statusesApplied.push(statusUpdated);
            if(statusUpdated.applyStatsAffectedImmediately === true)
                StatsAffected.applyStatusStatModifiers(participant, statusUpdated);
        }
        newSystemCall("Uczestnik " + participant.name + " stał się celem statusu " + status.displayName);
    }

    /**
     * This function inflicts the effects of the status on the participant as the fight goes on
     *
     * @function advanceStatus
     * @param {object} participant the participant who is the target of the status effect
     * @param {number} statusPos the position of the status in the statusesApplied array
     */
    static advanceStatus(participant, statusPos) {
        let status = participant.statusesApplied[statusPos];
        //if the participant is dead, only type revive status can be applied
        if(participant.health === 0 && status.type === "revive") {
            //check if the status can be used now
            if(status.length === 0) {
                let restored = restoreHp(status, participant);
                newSystemCall("Uczestnik "+participant.name+" powrócił do życia za sprawą statusu "+status.displayName + " z "+restored+" punktami zdrowia!");
            }
        }
        else if (participant.health > 0) {
            if (status.type === "restore") {
                let restored = restoreHp(status, participant);
                newSystemCall("Uczestnik " + participant.name + " odzyskał "+restored+ " zdrowia za sprawą statusu " + status.displayName);
            }
            else if (status.type === "damage") {
                let damaged = damageTarget(status, participant);
                newSystemCall("Uczestnik " + participant.name + " stracił "+damaged+" zdrowia za sprawą statusu " + status.displayName);
            }
        }
    }

    /**
     * This function advances each status of each participant effective at global turn
     *
     * @function advanceGlobalStatuses
     */
    static advanceGlobalStatuses() {
        //Search through every participant's statuses
        for (let i = 0; i < Settings.participants.length; ++i) {
            let participantStatuses = Settings.participants[i].statusesApplied;
            for (let j = 0; j < participantStatuses.length; j++) {
                //Find only the global statuses
                if (participantStatuses[j].effectiveTurn === "global") {
                    //first reduce the length by 1
                    participantStatuses[j].length -= 1;
                    //inflict the status effect on the participant
                    this.advanceStatus(Settings.participants[i], j);
                    //void the status if length dropped to 0
                    if (participantStatuses[j].length === 0) {
                        newSystemCall("Uczestnik " + Settings.participants[i].name + " nie jest już celem statusu " + participantStatuses[j].displayName);
                        this.voidStatus(Settings.participants[i], participantStatuses[j]);
                    }
                }
            }
        }
    }

    /**
     * This function advances each status of the current participant effective at start/end of the local turn
     *
     * @function advanceLocalStatuses
     * @param {string} effectiveAt apply the statuses at "start" or "end" of the local turn
     */
    static advanceLocalStatuses(effectiveAt) {
        //Search through current participant's statuses
        let participant = Participant.getCurrentlyActingParticipant();
        let participantStatuses = participant.statusesApplied;
        for (let i = 0; i < participantStatuses.length; ++i) {
            //Find only the local statuses effective at the start or end of turn
            if (participantStatuses[i].effectiveTurn === "local" && participantStatuses[i].effectiveAt === effectiveAt) {
                //first reduce the length by 1
                participantStatuses[i].length = participantStatuses[i].length - 1;
                //inflict the status effect on the participant
                this.advanceStatus(participant, i);
                //void the status if length dropped to 0
                if (participantStatuses[i].length === 0) {
                    newSystemCall("Uczestnik " + participant.name + " nie jest już celem statusu " + participantStatuses[i].displayName);
                    this.voidStatus(participant, participantStatuses[i]);
                }
            }
        }
    }

    /**
     * This function reduced the length of a persistent status
     * and voids the status if the length dropped to 0.
     *
     * @function advancePersistentStatus
     * @param {object} participant the participant targeted by the status
     * @param {string} statusName the name of the status to advance
     */
    static advancePersistentStatus(participant, statusName) {
        let statusToAdvance = this.getParticipantStatus(participant, {name: statusName});
        statusToAdvance.length -= 1;
        if(statusToAdvance.length <= 0) {
            newSystemCall("Uczestnik " + participant.name + " nie jest już celem statusu " + statusToAdvance.displayName);
            this.voidStatus(participant, statusToAdvance);
        }
    }

    /**
     * This function looks for a full status based on its name and returns it
     *
     * @function fetchStatusDefinitionByName
     * @param {string} statusName the name of the status to fetch
     * @returns {*[]|*} the status is found, empty array otherwise
     */
    static fetchStatusDefinitionByName(statusName) {
        let availableDefs = Settings.statuses.filter(s => s.name === statusName);
        if(availableDefs.length > 0)
            return availableDefs[0];
        else return [];
    }
}

/**
 * An object that shows which stats were affected by an action and how much
 * @typedef {Object} StatsAffected
 * @property {string} stat - the name of the statistic
 * @property {string} valType - flat or percentage
 * @property {number} val - the strength of the effect (flat - 5/10 etc.) or percentage (0.2 - 20%, 0.7 - 70%)
 */
class StatsAffected {
    //class constructor
    constructor(stat, valType, val) {
        this.stat = stat;
        this.valType = valType;
        this.val = val;
    }
    //class properties
    stat = "";
    valType = "";
    val = 0;

    /**
     * This function validates a statsAffected object instance
     *
     * @param {object} statsAffectedObject the instance to validate
     * @returns {boolean} true if valid, false otherwise
     */
    static validate(statsAffectedObject) {
        let statNames = ["strength", "speed", "agility", "cleverness", "appearance", "dodge", "attack", "maxHealth"];
        let statOK = (typeof statsAffectedObject.stat === 'string') && statNames.includes(statsAffectedObject.stat);
        let valTypeOK = (typeof statsAffectedObject.valType === 'string') && ["flat", "percentage"].includes(statsAffectedObject.valType);
        if(valTypeOK) {
            let valType = statsAffectedObject.valType;
            let val = statsAffectedObject.val;
            let valOK = valType === "flat" ? ((typeof val === 'number') && val !== 0) : (typeof val === 'number');
            return statOK && valTypeOK && valOK;
        }
        else return false;
    }

    /**
     * This function applies all of a status' stat modifiers to a participant
     *
     * @function applyStatusStatModifiers
     * @param {object} participant the target of the stat modifiers
     * @param {object} status the status with stat modifiers to apply
     */
    static applyStatusStatModifiers(participant, status) {
        let statusStatModifiers = status.statsAffectedList;
        for(let i = 0; i < statusStatModifiers.length; ++i) {
            //apply the stat modifier
            let valApplied = this.applyStatModifier(participant, statusStatModifiers[i]);
            //convert the percentage type to a flat value to properly add it back to the participant later
            if(statusStatModifiers[i].valType === "percentage") {
                statusStatModifiers[i].valType = "flat";
                statusStatModifiers[i].val = valApplied;
            }
        }
    }

    /**
     * This function applies a single stat modifier to a participant. The stat can't fall below 1.
     *
     * @function applyStatModifier
     * @param {object} participant the participating affected by a stat modifier
     * @param {object} statModifier the stat modifier, object of type StatsAffected
     * @return {number} value applied to a stat
     */
    static applyStatModifier(participant, statModifier) {
        let currentStatValue = participant[statModifier.stat];
        let updatedStatValue = statModifier.valType === "flat" ? (currentStatValue + statModifier.val) : (currentStatValue * statModifier.val);
        let finalStatValue = updatedStatValue > 0 ? updatedStatValue : 1;
        participant[statModifier.stat] = finalStatValue;
        return finalStatValue - currentStatValue;
    }

    /**
     * This function removes a stat modifier from a participant. The stat can't fall below 1.
     *
     * @function cancelStatModifiers
     * @param {object} participant the participant to remove the modifiers from
     * @param {object} status the status that has the stat modifiers to remove
     */
    static cancelStatModifiers(participant, status) {
        for(let i = 0; i < Object.keys(status.statsAffectedList || {}).length; ++i) {
            let statModifier = status.statsAffectedList[i];
            let currentStatValue = participant[statModifier.stat];
            let updatedStatValue = currentStatValue - statModifier.val;
            participant[statModifier.stat] = updatedStatValue < 1 ? 1 : updatedStatValue;
        }
    }
}

export {Status, StatsAffected}
