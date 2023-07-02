/**
 * @typedef {Object} Spell
 * @property {string} uspid - Unique spell id
 * @property {string} name - spell name
 * @property {string} range - how many participants are targets of the spell (individual, all, everyone - all of the same side or literally everyone)
 * @property {string} targetGroup - spell target's type (same/reversed - type is "player" or "enemy", this decides if we or the opponents are the target)
 * @property {string} type - spell type (healing/offensive/supporting)
 * @property {string} subtype - spell subtype (ex. healing can be used as restoring/reviving)
 * @property {number} value - spell numerical value (ex. 50 - restores 50 hp)
 * @property {string} valueType - spell value type (flat or percentage)
 * @property {number} cooldown - spell cooldown in global turns (1 means it's available next turn)
 * @property {number} priority - spell priority
 * @property {array} statusesApplied - Status objects applied or Internal names of the statuses applied (to be found) by the Spell
 * @property {string} statusTarget - If the spell applies a status, use it on the target of the skill ("target") or the "caster". Target by default.
 */
class Spell {
    //class constructor
    constructor(ustid) {
        this.ustid = ustid;
    }

    uspid = 0;
    value = 0;
    cooldown = 0;
    priority = 0;
    name = "";
    range = "";
    targetGroup = "";
    type = "";
    subtype = "";
    statusTarget = "";
    valueType = "";
    statusesApplied = [];

}