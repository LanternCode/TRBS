import {newSystemCall} from "./utils.js";
import {Settings} from "./settings.js";
import {damageTarget, restoreHp} from "./action.js";

/**
 * A status
 * @typedef {Object} Status
 * @property {string} ustid - unique status id, generated by MongoDb
 * @property {string} name - internal name of the status
 * @property {string} displayName - the name of the status seen by the user
 * @property {string} description - the description of the status effect visible to the user
 * @property {string} effectiveAt - whether the status is applied as the start or end of the local turn (start/end)
 * @property {string} effectiveTurn - whether the status is applied at the local, global or throughout turn (local/global/persistent)
 * @property {string} type - status type (restore/damage/revive/statModifier)
 * @property {string} strengthType - the strength can be "flat" or "percentage" (10 damage vs. 10% of hp)
 * @property {number} defaultLength - if length is not specified, the defaultLength will be used
 * @property {number} length - how many turns the status will last
 * @property {number} defaultStrength - if strength is not specified, the defaultStrength will be used
 * @property {number} strength - how strong the status is, ex. 5/10/25 (damage/healing etc.) or how many uses it has
 * @property {array} statsAffectedList - list of StatsAffected objects that list which statistics were affected and how much
 * @property {boolean} statusClearable - true if the status can be voided by in-game actions, false otherwise
 * @property {boolean} lastUntilCleared - true if the status lasts indefinitely (until cleared), false otherwise
 * @property {boolean} useDefaultStrengthSource - true to use a default stat to take strength from (level/zone), false otherwise
 * @property {boolean} applyStatsAffectedImmediately - some statuses delay the application of stat modifiers, ex. fury, true otherwise.
 */
class Status {
    constructor(ustid) {
        this.ustid = ustid;
    }
    /**
     * @property ustid
     * @type {string}
     */
    ustid = "";
    get getUstid() {
        return this.ustid;
    }
    set setUstid(value) {
        this.ustid = value;
    }
    /**
     * @property name
     * @type {string}
     */
    name = "";
    get getName() {
        return this.name;
    }
    set setName(value) {
        this.name = value;
    }
    /**
     * @property displayName
     * @type {string}
     */
    displayName = "";
    get getDisplayName() {
        return this.displayName;
    }
    set setDisplayName(value) {
        this.displayName = value;
    }
    /**
     * @property description
     * @type {string}
     */
    description = "";
    get getDescription() {
        return this.description;
    }
    set setDescription(value) {
        this.description = value;
    }
    /**
     * @property effectiveAt
     * @type {string}
     */
    effectiveAt = "";
    get getEffectiveAt() {
        return this.effectiveAt;
    }
    set setEffectiveAt(value) {
        this.effectiveAt = value;
    }
    /**
     * @property effectiveTurn
     * @type {string}
     */
    effectiveTurn = "";
    get getEffectiveTurn() {
        return this.effectiveTurn;
    }
    set setEffectiveTurn(value) {
        this.effectiveTurn = value;
    }
    /**
     * @property type
     * @type {string}
     */
    type = "";
    get getType() {
        return this.type;
    }
    set setType(value) {
        this.type = value;
    }
    /**
     * @property strengthType
     * @type {string}
     */
    strengthType = "";
    get getStrengthType() {
        return this.strengthType;
    }
    set setStrengthType(value) {
        this.strengthType = value;
    }
    /**
     * @property defaultLength
     * @type {number}
     */
    defaultLength = 0;
    /**
     * @property length
     * @type {number}
     */
    length = 0;
    /**
     * @property defaultStrength
     * @type {number}
     */
    defaultStrength = 0;
    /**
     * @property strength
     * @type {number}
     */
    strength = 0;
    /**
     * @property statsAffectedList
     * @type {array}
     */
    statsAffectedList = [];
    /**
     * @property statusClearable
     * @type {boolean}
     */
    statusClearable = false;
    /**
     * @property lastUntilCleared
     * @type {boolean}
     */
    lastUntilCleared = false;
    /**
     * @property useDefaultStrengthSource
     * @type {boolean}
     */
    useDefaultStrengthSource = false;
    /**
     * @property applyStatsAffectedImmediately
     * @type {boolean}
     */
    applyStatsAffectedImmediately = true;

    /**
     * This function takes a status and checks if it is valid. Prints an error message if invalid.
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
        //if length is not defined, check if defaultLength is defined
        if(!lengthOK) {
            let defaultLengthOK = status.defaultLength > 0;
            //if defaultLength is not defined, the status is invalid
            if(!defaultLengthOK) {
                errorMessage += "Nie podano czasu trwania statusu (length)\n";
            }
        }
        //then check if strength is defined
        let strengthOK = status.strength > 0;
        //strength must be defined for non-persistent non-statModifier statuses
        if(!strengthOK && (status.effectiveTurn === "start" || status.effectiveTurn === "end")) {
            //default strength must be > 0
            let defaultStrengthOK = status.defaultStrength > 0;
            //default strength source must be defined
            let defaultStrengthSourceOK = status.useDefaultStrengthSource;
            //if defaultStrength is not defined and useSource is false, the status is invalid
            if(!defaultStrengthOK && !defaultStrengthSourceOK) {
                errorMessage += "Nie podano siły statusu (strength)\n";
            }
        }
        //name, displayName and description must all be defined
        let nameOK = (typeof status.name === 'string') && status.name.length > 0;
        let displayNameOK = (typeof status.displayName === 'string') && status.displayName.length > 0;
        let descriptionOK = (typeof status.description === 'string') && status.description.length > 0;
        if(!nameOK || !displayNameOK || !descriptionOK) {
            if(!nameOK) errorMessage += "Nie podano wewnętrznej nazwy statusu (name)\n";
            if(!displayNameOK) errorMessage += "Nie podano wyświetlanej nazwy statusu (displayName)\n";
            if(!descriptionOK) errorMessage += "Nie podano opisu statusu (description)\n";
        }
        //effectiveAt, effectiveTurn and type must be specified and have one of the pre-defined values
        let effectiveTurnOK = (typeof status.effectiveTurn === 'string') && ["local", "global", "persistent"].includes(status.effectiveTurn);
        let typeOK = (typeof status.type === 'string') && ["restore", "damage", "revive", "statModifier"].includes(status.type);
        let effectiveAtOK = false;
        if(effectiveTurnOK) {
            //global turns do not require effectiveAt, local must be "start" or "end", persistent needs a correct listener
            let effAt = status.effectiveAt;
            let effTurn = status.effectiveTurn;
            let allowedValues = effTurn === "persistent" ? ["onAct", "onDamage", "onHit", "onRestoreHp", "onDeath", "onStartTurn", "onApplyStatus", "onEscape"]
                : (effTurn === "local" ? ["start", "end"]
                    : "");
            effectiveAtOK = effTurn === "global" ? true : ((typeof effTurn === 'string') && allowedValues.includes(effAt));
        }
        if(!effectiveAtOK || !effectiveTurnOK || !typeOK) {
            if(!effectiveAtOK) errorMessage += "Podano niepoprawny momentu działania statusu (effectiveAt)\n";
            if(!effectiveTurnOK) errorMessage += "Podano niepoprawny moment redukcji czasu działania statusu (effectiveTurn)\n";
            if(!typeOK) errorMessage += "Podano niepoprawny typ statusu (type)\n";
        }
        status.statsAffectedList = typeof status.statsAffectedList == "undefined" ? [] : status.statsAffectedList;
        //statsAffectedList must match the specification of the object, so the object's validation method is used
        let statsAffectedListOK = true;
        for(let i = 0; i < status.statsAffectedList.length; ++i) {
            let statsAffectedListElementOK = StatsAffected.validate(status.statsAffectedList[i]);
            statsAffectedListOK = statsAffectedListElementOK === true ? statsAffectedListOK : false;
            if(!statsAffectedListElementOK) errorMessage += "Wskazane zmiany statystyk nr. "+i+" przez status są niepoprawne (statsAffectedList["+i+"])\n";
        }
        if(!statsAffectedListOK) {
            errorMessage += "Wskazane zmiany statystyk przez status są niepoprawne (statsAffectedList)\n";
        }
        if(errorMessage !== "") {
            if(Settings.getDebuggingEnabled)
                newSystemCall(errorMessage);
            return false;
        }
        else return true;
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
        let statusList = participant.statusesApplied;
        if (statusList.length === 0) return [];
        else {
            let matchingStatuses = statusList.filter(s => s.effectiveAt === listener).map(s => s.name);
            return matchingStatuses;
        }
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
        //first check the length is specified
        let lengthDefined = status.length > 0;
        if(!lengthDefined) {
            status.length = status.defaultLength;
        }
        //then check if strength is defined
        let strengthDefined = status.strength > 0;
        if(!strengthDefined) {
            //if not, check if default strength source is to be used
            let useDefaultStrengthSource = status.useDefaultStrengthSource;
            if(useDefaultStrengthSource) {
                //use the default strength source
                let pType = Settings.participants[Settings.localTurn].type;
                let defaultStrSrc = pType === "player" ? "level" : "zone";
                status.strength = Settings.participants[Settings.localTurn][defaultStrSrc];
            } //else use default strength
            else status.strength = status.defaultStrength;
        }
        //return the updates status
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
            //if the status had any stat modifiers, these must be cancelled first
            StatsAffected.cancelStatModifiers(participant, participantStatuses[statusPosition]);
            participantStatuses.splice(statusPosition, 1);
        }
    }

    /**
     * This function voids all clearable statuses of a participant
     * Used mostly on death or use of Cleansing Potion item
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
     * This function takes a participant and a status, and then applies the status on that participant
     *
     * @function applyStatus
     * @param {object} participant the target of the status
     * @param {object} status the status object
     */
    static applyStatus(participant, status) {
        //before you apply the status, validate it
        let statusValid = Status.validate(status);
        if (!statusValid) return;
        //check if the target is protected against statuses
        let activeOnApplyStatusStatuses = Status.getParticipantsPersistentStatuses(participant, "onApplyStatus");
        if(activeOnApplyStatusStatuses.includes("statusResistance")) return;
        //apply defaultLength and defaultStrength where required
        let statusUpdated = Status.applyDefaultValues(status);
        //if the status is valid, check that the participant is not already affected by it
        let participantAlreadyAffected = Status.isParticipantAffected(participant, statusUpdated);
        if(participantAlreadyAffected) {
            //if the participant is already affected, fetch the participant's version of the status
            let participantAffectedBy = Status.getParticipantStatus(participant, statusUpdated);
            //check which status is stronger by comparing their strengths and lengths
            let strongerStatus = Status.compareStatusPower(participantAffectedBy, statusUpdated);
            //replace the previous status with the new status if it is stronger
            if(statusUpdated === strongerStatus) {
                //cancel all current stat modifiers from that status
                StatsAffected.cancelStatModifiers(participant, statusUpdated);
                //apply the status and any stat modifiers
                Status.replaceParticipantStatus(participant, statusUpdated, strongerStatus);
                if(strongerStatus.applyStatsAffectedImmediately === true)
                    StatsAffected.applyStatusStatModifiers(participant, strongerStatus);
            }
        }
        else {
            //apply the status and any stat modifiers
            participant.statusesApplied.push(statusUpdated);
            if(statusUpdated.applyStatsAffectedImmediately === true)
                StatsAffected.applyStatusStatModifiers(participant, statusUpdated);
        }
        newSystemCall("Uczestnik " + participant.name + " stał się celem statusu " + status.displayName);
    }

    /**
     * This function inflicts the effects of the status on the participant
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
                    console.log(participantStatuses[j]);
                    console.log(participantStatuses[j].length);
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
        let participant = Settings.participants[Settings.localTurn];
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
}

/**
 * An object that shows which stats were affected by an action and how much
 * @typedef {Object} StatsAffected
 * @property {string} stat - the name of the statistic
 * @property {string} valType - flat or percentage
 * @property {number} val - the strength of the effect (flat - 5/10 etc.) or percentage (0.2 - 20%, 0.7 - 70%)
 */
class StatsAffected {
    constructor(stat, valType, val) {
        this.stat = stat;
        this.valType = valType;
        this.val = val;
    }
    /**
     * @property stat
     * @type {string}
     */
    stat = "";
    get getStat() {
        return this.stat;
    }
    set setStat(value) {
        this.stat = value;
    }
    /**
     * @property stat
     * @type {string}
     */
    valType = "";
    get getValType() {
        return this.valType;
    }
    set setValType(value) {
        this.valType = value;
    }
    /**
     * @property val
     * @type {number}
     */
    val = 0;
    get getVal() {
        return this.val;
    }
    set setVal(value) {
        this.val = value;
    }

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
            let valOK = valType === "flat" ? ((typeof val === 'number') && val !== 0) : ((typeof val === 'number') && val > 0 && val <= 1);
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
            console.log(statusStatModifiers[i]);
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
        let valToApply = statModifier.valType === "flat" ? statModifier.val : (currentStatValue * statModifier.val);
        let updatedStatValue = currentStatValue + valToApply;
        let finalStatValue = updatedStatValue > 0 ? updatedStatValue : 1;
        participant[statModifier.stat] = finalStatValue;
        return valToApply;
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
            let finalStatValue = updatedStatValue < 1 ? 1 : updatedStatValue;
            participant[statModifier.stat] = finalStatValue;
        }
    }
}

export {Status, StatsAffected}
