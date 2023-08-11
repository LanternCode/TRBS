/**
 * @typedef {Object} Skill
 * @property {string} usid - Unique skill id
 * @property {string} name - Skill name
 * @property {string} range - how many participants are targets of the skill (individual, all, everyone - all of the same side or literally everyone)
 * @property {string} targetGroup - Skill target group (player, enemy, reversed - reversed means the opposite of the user)
 * @property {string} type - Skill type (healing/offensive/supporting/?)
 * @property {string} subtype - Skill subtype (ex. healing can be used as restoring/reviving)
 * @property {number} value - Skill numerical value (ex. 50 - restores 50 hp)
 * @property {string} valueType - Skill value type (flat or percentage)
 * @property {number} cooldown - Skill cooldown in global turns (1 means it's available next turn)
 * @property {number} priority - Skill priority required
 * @property {array} statusesApplied - Status objects applied or Internal names of the statuses applied (to be found) by the Skill
 * @property {string} statusTarget - If the skill applies a status, use it on the target of the skill ("target") or the "caster". Target by default.
 * @property {string} hitMark - a threshold at which the skill hits (using a d20 roll)
 */
class Skill {
    //class constructor
    constructor(usid) {
        this.usid = usid;
    }

    usid = 0;
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
    hitMark = "";
    statusesApplied = [];
}

export { Skill };