import { Settings } from "./settings.js";

function makeRequest(method, url, body = null) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send(body);
    });
}

/**
 * This function obtains the players list
 *
 * @function getAvailablePlayers
 * @returns {[{dodge: number, level: number, itemsOwned: {"1": number, "2": number, "3": number, "4": number, "5": number}, health: number, experience: number, type: string, skillsOwned: {Próżnia: number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number},{dodge: number, level: number, itemsOwned: {"1": number, "2": number, "3": number, "4": number, "5": number}, health: number, experience: number, type: string, skillsOwned: {"Energy Ball": number, Kumulacja: number, Hellfire: number, "Wielki Wybuch": number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number},{dodge: number, level: number, itemsOwned: {"1": number, "2": number, "3": number, "4": number, "5": number}, health: number, experience: number, type: string, skillsOwned: {Przygrywka: number, Wskrzeszenie: number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number},{dodge: number, level: number, itemsOwned: {"1": number, "2": number, "3": number, "4": number, "5": number}, health: number, experience: number, type: string, skillsOwned: {"Energy Ball": number, Kumulacja: number, Hellfire: number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number}]}
 */
 async function getAvailablePlayers()
 {
    let result = await makeRequest("GET", Settings.getBaseURL + "players/");
    console.log(result);
    return JSON.parse(result);
 }

/**
 * This function obtains the enemies list
 *
 * @function getAvailableEnemies
 * @return {[{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number}]}
 */
async function getAvailableEnemies()
{
    let result = await makeRequest("GET", Settings.getBaseURL + "enemies/");
    return JSON.parse(result);
}

/**
* This function obtains the items list
*
* @function getItems
 * @return {[{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number},{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number},{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number},{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number},{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number}]}
 */
async function getItems()
{
    let result = await makeRequest("GET", Settings.getBaseURL + "items/");
    return JSON.parse(result);
}

/**
* This function obtains the skills list
*
* @function getSkills
 * @return {[{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},null,null]}
 */
async function getSkills()
{
    let result = await makeRequest("GET", Settings.getBaseURL + "skills/");
    return JSON.parse(result);
}

/**
 * This function inserts a participant into the collection
 *
 * @function insertParticipant
 * @param participant the object to insert
 * @param type participant type (player/enemy)
 */
async function insertParticipant(participant, type)
{
    let insertedParticipantId = await makeRequest("PUT", Settings.getBaseURL + "participants/" + JSON.stringify(participant) + "/" + type );
    return insertedParticipantId;
}

/**
 * This function removes a participant from its corresponding collection
 *
 * @function dropParticipant
 * @param participant The participant object
 * @param type Participant type (player/enemy)
 */
function dropParticipant(participant, type)
{
    makeRequest("DELETE", Settings.getBaseURL + "dropParticipant/" + JSON.stringify(participant) + "/" + type );
}

/**
 * This function updates a named participant
 *
 * @function updateParticipant
 * @param participant The participant object to update
 * @param type Participant type (player/enemy)
 */
function updateParticipant(participant, type)
{
    participant.inUse = false;
    makeRequest("PUT", Settings.getBaseURL + "updateParticipant/" + JSON.stringify(participant) + "/" + type );
}

/**
 * This function updates the player's experience in the collection
 *
 * @function experienceUp
 * @param player The player to get experience
 */
function experienceUp(player)
{
    makeRequest("PUT", Settings.getBaseURL + "grantExperience/" + JSON.stringify(player) );
}

export {getAvailablePlayers, getAvailableEnemies, getItems, getSkills, insertParticipant, dropParticipant, updateParticipant, experienceUp};
