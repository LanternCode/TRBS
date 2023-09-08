import {act} from "./action.js";
import {startBattle, continueToBattle, startNextTurn, loadDefaultTemplate} from "./battle.js";
import {adjustOptions} from "./list.js";
import {Settings} from "./settings.js";
import {addCardInit} from "./cardPicker.js";

const actionsList = document.getElementById("actionList");
const actionElementsList = document.getElementById("actionElementsList");
const addPlayerCardButton = document.getElementById("addPlayerCardButton");
const addEnemyCardButton = document.getElementById("addEnemyCardButton");
const actButton = document.getElementById("actButton");
const loadTemplateButton = document.getElementById("loadDefaultTemplate");
const startBattleButton = document.getElementById("startBattleButton");
const continueToBattleButton = document.getElementById("continueToBattleButton");
const nextTurnButton = document.getElementById("nextTurnButton");

actionsList.addEventListener("change", () =>  { adjustOptions("actionElements") }, false);
actionElementsList.addEventListener("change", () => { adjustOptions("targets") }, false);
addPlayerCardButton.addEventListener("click", () => { addCardInit("player") }, false);
addEnemyCardButton.addEventListener("click", () => { addCardInit("enemy") }, false);
actButton.addEventListener("click", () => { act() }, false);
startBattleButton.addEventListener("click", () => { startBattle() }, false);
loadTemplateButton.addEventListener("click", () => { loadDefaultTemplate() }, false);
continueToBattleButton.addEventListener("click", () => { continueToBattle() }, false);
nextTurnButton.addEventListener("click", () => { startNextTurn() }, false);

await Settings.fetchEnemies();

/**
 * An Item
 * @typedef {Object} Item
 * @property {string} uiid - Unique item id
 * @property {string} displayName - Item display name
 * @property {string} type - Item type (healing/statModifier)
 * @property {string} subtype - item subtype (for healing items - restore/revive. for statMods - self/reverse to specify the target)
 * @property {string} valueType - Item value type (flat or percentage)
 * @property {number} value - Item value (flat number or decimal percentage)
 * @property {array} statusesApplied - Status objects applied or Internal names of the statuses applied (to be found) by the item
 */
await Settings.fetchItems();

await Settings.fetchSpells();
await Settings.fetchSkills();

await Settings.fetchStatuses();