const base_url = "http://localhost:3000/";

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
    let result = await makeRequest("GET", base_url + "players/");
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
    let result = await makeRequest("GET", base_url + "enemies/");
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
    let result = await makeRequest("GET", base_url + "items/");
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
    let result = await makeRequest("GET", base_url + "skills/");
    return JSON.parse(result);
}

/**
 * This function inserts a participant into the collection
 *
 * @function insertParticipant
 * @param participant the object to insert
 * @param type participant type (player/enemy)
 */
function insertParticpant(participant, type)
{
    let body = JSON.stringify({
        "participant": participant,
        "type": type
    });

    makeRequest("PUT", base_url + "participants/" + JSON.stringify(participant) + "/" + type );
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
    Settings.db.connect();
    if(type === "player") {
        Settings.db("TRBS").collection(type).deleteOne({ "UID" : participant.UID });
    }
    else {
        Settings.db("TRBS").collection(type).deleteOne({ "name" : participant.name });
    }
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
    Settings.db.connect();
    if(type === "player") {
        Settings.db("TRBS").collection(type).updateOne({ "UID" : participant.UID }, participant);
    }
    else {
        Settings.db("TRBS").collection(type).updateOne({ "name" : participant.name }, participant);
    }
}

/**
 * This function updates the player's experience in the collection
 *
 * @function experienceUp
 * @param player The player to get experience
 */
function experienceUp(player)
{
    Settings.db.connect();
    Settings.db("TRBS").collection("player").updateOne(
        { "UID" : player.UID },
        { "experience": player.experience + 1 }
    );
}

export {getAvailablePlayers, getAvailableEnemies, getItems, getSkills, insertParticipant, dropParticipant, updateParticipant, experienceUp};
