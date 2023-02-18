import {nextTurn, act} from "./action.js";
import {startBattle, continueToBattle} from "./battle.js";
import {addCard} from "./card.js";
import {adjustOptions} from "./list.js";
import {Settings} from "./settings.js";

const actionsList = document.getElementById("actionList");
const actionElementsList = document.getElementById("actionElementsList");
const addPlayerCardButton = document.getElementById("addPlayerCardButton");
const addEnemyCardButton = document.getElementById("addEnemyCardButton");
const actButton = document.getElementById("actButton");
const startBattleButton = document.getElementById("startBattleButton");
const continueToBattleButton = document.getElementById("continueToBattleButton");
const nextTurnButton = document.getElementById("nextTurnButton");

actionsList.addEventListener("change", () =>  { adjustOptions("actionElements") }, false);
actionElementsList.addEventListener("change", () => { adjustOptions("targets") }, false);
addPlayerCardButton.addEventListener("click", () => { addCard("player") }, false);
addEnemyCardButton.addEventListener("click", () => { addCard("enemy") }, false);
actButton.addEventListener("click", () => { act() }, false);
startBattleButton.addEventListener("click", () => { startBattle() }, false);
continueToBattleButton.addEventListener("click", () => { continueToBattle() }, false);
nextTurnButton.addEventListener("click", () => { nextTurn() }, false);

/**
 * A Participant
 * @typedef {Object} Participant
 * @property {string} name - Participant's name
 * @property {number} maxHealth - Participant's endurance
 * @property {number} health - Participant's current hp (for use in battles)
 * @property {number} speed - Participant's speed
 * @property {number} atk - Participant's attack
 * @property {number} dodge - Participant's dodge
 * @property {boolean} isDodging - Participant dodge action on or off
 * @property {string} type - Participant type (enemy/player)
 * @property {string} [subtype] - Enemy type (human/monster)
 * @property {number} [experience] - Participant's xp count, only for players
 * @property {Object} [itemsOwned] - Participant's items, only for players and human enemies
 * @property {Object} skillsOwned - Participant's skills/spells
 * @property {number} [level] - Participant's level, only for players
 * @property {number} armor - Participant's armor rating
 * @property {number} [zone] - Participant's zone, only for enemies
 */
await Settings.fetchPlayers();
await Settings.fetchEnemies();

/**
 * An Item
 * @typedef {Object} Item
 * @property {string} uiid - Unique item id
 * @property {string} displayName - Item display name
 * @property {string} type - Item type (for now only healing)
 * @property {string} subtype - item subtype (for healing items - restore/revive)
 * @property {string} valueType - Item value type (flat or percentage)
 * @property {number} value - Item value (flat number or decimal percentage)
 */
await Settings.fetchItems();

/**
 * A Skill/Spell (for now they're the same thing)
 * @typedef {Object} SkillSpell
 * @property {string} usid - Unique skill id
 * @property {string} name - Skill/spell name
 * @property {string} range - how many participants are targets of the skill/spell (individual, all, everyone - all of the same side or literally everyone)
 * @property {string} target_group - Skill/spell target group (player, enemy, reversed - reversed means the opposite of the user)
 * @property {string} type - Skill/spell type (healing/offensive/supporting/?)
 * @property {string} subtype - Skill/spell subtype (ex. healing can be used as restoring/reviving)
 * @property {string} value - Skill/spell numerical value (ex. 50 - restores 50 hp)
 * @property {string} value_type - Skill/spell value type (flat or percentage)
 * @property {string} value_dep - Skill/spell dependancy (talent/level/special)
 * @property {string} dep - Skill/spell name of the dependancy (ex. sorcery)
 * @property {string} [dep_pattern] - Skill/spell value-dependancy pattern (irregular patterns only)
 * @property {string} cooldown - Skill/spell cooldown in global turns (1 means it's available next turn)
 * @property {string} [cost] - Skill/spell cost (not yet used anywhere)
 * @property {string} priority - Skill/spell priority required
 */
await Settings.fetchSkills();
