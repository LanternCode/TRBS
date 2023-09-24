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
 * @returns {Promise<any>}
 */
 async function getAvailablePlayers()
 {
    let result = await makeRequest("GET", Settings.baseURL + "players/");
    return JSON.parse(result);
 }

/**
 * This function obtains the enemies list
 *
 * @function getAvailableEnemies
 * @returns {Promise<any>}
 */
async function getAvailableEnemies()
{
    let result = await makeRequest("GET", Settings.baseURL + "enemies/");
    return JSON.parse(result);
}

/**
 * This function obtains the items list
 *
 * @function getItems
 * @returns {Promise<any>}
 */
async function getItems()
{
    let result = await makeRequest("GET", Settings.baseURL + "items/");
    return JSON.parse(result);
}

/**
 * This function obtains the skills list
 *
 * @function getSkills
 * @returns {Promise<any>}
 */
async function getSkills()
{
    let result = await makeRequest("GET", Settings.baseURL + "skills/");
    return JSON.parse(result);
}

/**
 * This function obtains the spells list
 *
 * @function getSpells
 * @returns {Promise<any>}
 */
async function getSpells()
{
    let result = await makeRequest("GET", Settings.baseURL + "spells/");
    return JSON.parse(result);
}

/**
 * This function obtains the status list
 *
 * @function getStatuses
 * @returns {Promise<any>}
 */
async function getStatuses()
{
    let result = await makeRequest("GET", Settings.baseURL + "statuses/");
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
    let insertedParticipantId = await makeRequest("PUT", Settings.baseURL + "participants/" + JSON.stringify(participant) + "/" + type );
    return insertedParticipantId;
}

/**
 * This function inserts a status into the collection
 *
 * @function insertStatus
 * @param {object} status the object to insert
 * @return {string} the generated _id of the status
 */
async function insertStatus(status)
{
    let insertedStatusId = await makeRequest("PUT", Settings.baseURL + "statuses/" + JSON.stringify(status) + "/");
    return insertedStatusId;
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
    makeRequest("DELETE", Settings.baseURL + "dropParticipant/" + JSON.stringify(participant) + "/" + type );
}

/**
 * This function removes a status from the database
 *
 * @function dropStatus
 * @param {object} status The status object
 */
function dropStatus(status)
{
    makeRequest("DELETE", Settings.baseURL + "dropStatus/" + JSON.stringify(status) + "/");
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
    makeRequest("PUT", Settings.baseURL + "updateParticipant/" + JSON.stringify(participant) + "/" + type );
}

/**
 * This function updates a named status
 *
 * @function updateStatus
 * @param {object} status The status object to update
 */
function updateStatus(status)
{
    makeRequest("PUT", Settings.baseURL + "updateStatus/" + JSON.stringify(status) + "/");
}

/**
 * This function updates the player's experience in the collection
 *
 * @function experienceUp
 * @param player The player to get experience
 */
function experienceUp(player)
{
    makeRequest("PUT", Settings.baseURL + "grantExperience/" + JSON.stringify(player) );
}

/**
 * This function updates the player's gold in the collection
 *
 * @function payday
 * @param player The player to get paid
 */
function payday(player)
{
    makeRequest("PUT", Settings.baseURL + "payday/" + JSON.stringify(player) );
}

/**
 * This function updates the player's inventory after they win items in battle
 *
 * @function paydayII
 * @param player The player to get loot
 */
function paydayII(player)
{
    makeRequest("PUT", Settings.baseURL + "updateInventory/" + JSON.stringify(player) );
}

export {getAvailablePlayers, getAvailableEnemies, getItems, getSkills, getStatuses, insertParticipant, dropParticipant, updateParticipant, experienceUp, getSpells, payday, paydayII};
