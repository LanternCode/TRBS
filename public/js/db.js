/**
 * This function obtains the players list
 *
 * @function getAvailablePlayers
 * @returns {[{dodge: number, level: number, itemsOwned: {"1": number, "2": number, "3": number, "4": number, "5": number}, health: number, experience: number, type: string, skillsOwned: {Próżnia: number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number},{dodge: number, level: number, itemsOwned: {"1": number, "2": number, "3": number, "4": number, "5": number}, health: number, experience: number, type: string, skillsOwned: {"Energy Ball": number, Kumulacja: number, Hellfire: number, "Wielki Wybuch": number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number},{dodge: number, level: number, itemsOwned: {"1": number, "2": number, "3": number, "4": number, "5": number}, health: number, experience: number, type: string, skillsOwned: {Przygrywka: number, Wskrzeszenie: number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number},{dodge: number, level: number, itemsOwned: {"1": number, "2": number, "3": number, "4": number, "5": number}, health: number, experience: number, type: string, skillsOwned: {"Energy Ball": number, Kumulacja: number, Hellfire: number}, speed: number, UID: number, isDodging: number, armor: number, name: string, inUse: boolean, atk: number, maxHealth: number}]}
 */
 async function getAvailablePlayers()
 {
    let players = await db.collection("player").find().toArray();
    return players;
 }

/**
 * This function obtains the enemies list
 *
 * @function getAvailableEnemies
 * @return {[{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number},{isDodging: number, dodge: number, armor: number, level: number, name: string, itemsOwned: {life_potion: number, life_flask: number, small_life_potion: number, large_life_potion: number, regeneration_flask: number}, health: number, atk: number, maxHealth: number, experience: number, type: string, speed: number}]}
 */
async function getAvailableEnemies()
{
   let enemies = await db.collection("enemy").find().toArray();
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
   let items = await db.collection("item").find().toArray();
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
   let skills = await db.collection("skill").find().toArray();
   return skills;
}

/**
 * This function inserts a participant into the collection
 *
 * @function insertParticipant
 * @param participant the object to insert
 * @param type participant type (player/enemy)
 */
function insertParticipant(participant, type)
{
    db.collection(type).insertOne(participant);
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
    if(type === "player") {
        db.collection("player").deleteOne({ "UID" : participant.UID });
    }
    else {
        db.collection("enemy").deleteOne({ "name" : participant.name });
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
    if(type === "player") {
        db.collection("player").updateOne({ "UID" : participant.UID }, participant);
    }
    else {
        db.collection("enemy").updateOne({ "name" : participant.name }, participant);
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
    db.collection("player").updateOne(
        { "UID" : player.UID },
        { "experience": player.experience + 1 }
    );
}

export {getAvailablePlayers, getAvailableEnemies, getItems, getSkills, insertParticipant, dropParticipant, updateParticipant, experienceUp};
