/**
 * A status
 * @typedef {Object} Status
 * @property {string} ustid - unique status id, generated by MongoDb
 * @property {string} name - internal name of the status
 * @property {string} displayName - the name of the status seen by the user
 * @property {string} description - the description of the status effect visible to the user
 * @property {string} effectiveAt - whether the status is applied as the start or end of the turn (start/end)
 * @property {string} effectiveTurn - whether the status is applied at the local, global or throughout turn (local/global/persistent)
 * @property {string} type - status type (supportive/offensive/special)
 * @property {string} subtype - status subtype (restore/damaging/revive/boost)
 * @property {number} defaultLength - if length is not specified, the defaultLength will be used
 * @property {number} length - how many turns the status will last
 * @property {number} defaultStrength - if strength is not specified, the defaultStrength will be used
 * @property {number} strength - how strong the status is, ex. 5/10/25 (damage/healing etc.) or how many uses it has
 * @property {object} statsAffectedList - list of statsAffected objects that list which statistics were affected and how much
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
     * @property subtype
     * @type {string}
     */
    subtype = "";
    get getSubtype() {
        return this.subtype;
    }
    set setSubtype(value) {
        this.subtype = value;
    }
    /**
     * @property defaultLength
     * @type {number}
     */
    defaultLength = 0;
    get getDefaultLength() {
        return this.defaultLength;
    }
    set setDefaultLength(value) {
        this.defaultLength = value;
    }
    /**
     * @property length
     * @type {number}
     */
    length = 0;
    get getLength() {
        return this.length;
    }
    set setLength(value) {
        this.length = value;
    }
    /**
     * @property defaultStrength
     * @type {number}
     */
    defaultStrength = 0;
    get getDefaultStrength() {
        return this.defaultStrength;
    }
    set setDefaultStrength(value) {
        this.defaultStrength = value;
    }
    /**
     * @property strength
     * @type {number}
     */
    strength = 0;
    get getStrength() {
        return this.strength;
    }
    set setStrength(value) {
        this.strength = value;
    }
    /**
     * @property statsAffectedList
     * @type {object}
     */
    statsAffectedList = {};
    get statsAffectedList() {
        return this.statsAffectedList;
    }
    set statsAffectedList(value) {
        this.statsAffectedList = value;
    }
}

/**
 * An object that shows which stats were affected by an action and how much
 * @typedef {Object} statsAffected
 * @property {string} stat - the name of the statistic
 * @property {number} val - the strength of the effect
 */
class statsAffected {
    constructor(stat, val) {
        this.stat = stat;
        this.val = val;
    }
    /**
     * @property stat
     * @type {string}
     */
    stat = {};
    get getStat() {
        return this.stat;
    }
    set setStat(value) {
        this.stat = value;
    }
    /**
     * @property val
     * @type {number}
     */
    val = {};
    get getVal() {
        return this.val;
    }
    set setVal(value) {
        this.val = value;
    }
}

export {Status, statsAffected}