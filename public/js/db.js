import {generateRandomItems, generateNewEnemy} from "./card.js"; // temp

function makeRequest(method, url) {
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
        xhr.send();
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
    let result = await makeRequest("GET", "http://localhost:3000/players/");
    console.log(JSON.parse(result));
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
    Settings.db.connect();
    let enemies = await Settings.db("TRBS").collection("enemy").find().toArray();
    return enemies;
}

/**
* This function obtains the items list
*
* @function getItems
 * @return {[{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number},{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number},{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number},{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number},{subtype: string, displayName: string, valueType: string, uiid: number, type: string, value: number}]}
 */
async function getItems()
{
    Settings.db.connect();
    var items = await Settings.db("TRBS").collection("item").find().toArray();
    return items;
}

/**
* This function obtains the skills list
*
* @function getSkills
 * @return {[{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},{targetGroup: string, subtype: string, valueType: string, name: string, cooldown: number, range: string, type: string, priority: number, value: number, usid: number},null,null]}
 */
async function getSkills()
{
    Settings.db.connect();
   var skills = await Settings.db("TRBS").collection("skill").find().toArray();
   return skills;
}


function insertParticpant(participant, type)
{
    Settings.db.connect();
    Settings.db("TRBS").collection(type).insertOne(participant);
}


function dropParticpant(participant, type)
{
    Settings.db.connect();
    if(type === "player") {
        Settings.db("TRBS").collection(type).deleteOne({ "UID" : participant.UID });
    }
    else {
        Settings.db("TRBS").collection(type).deleteOne({ "name" : participant.name });
    }
}


function updateParticpant(participant, type)
{
    Settings.db.connect();
    if(type === "player") {
        Settings.db("TRBS").collection(type).updateOne({ "UID" : participant.UID }, participant);
    }
    else {
        Settings.db("TRBS").collection(type).updateOne({ "name" : participant.name }, participant);
    }
}


function experienceUp(player)
{
    Settings.db.connect();
    Settings.db("TRBS").collection("player").updateOne(
        { "UID" : player.UID },
        { "experience": player.experience + 1 }
    );
}


export {getAvailablePlayers, getAvailableEnemies, getItems, getSkills, insertParticpant, dropParticpant, updateParticpant, experienceUp};
