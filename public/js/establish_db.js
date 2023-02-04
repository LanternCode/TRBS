import { MongoClient, ServerApiVersion } from 'mongodb';

/**
 * This function establishes connection with the database and returns the client object for other methods to act on
 * @returns {Promise<MongoClient>}
 */
export async function connectToCluster() {
    const uri = process.env.DB_URI;
    let mongoClient;

    try {
        mongoClient = new MongoClient(uri);
        console.log('Connecting to MongoDB Atlas cluster...');
        await mongoClient.connect();
        console.log('Successfully connected to MongoDB Atlas!');
        return mongoClient;
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        process.exit();
    }
}

/**
 * This function inserts the pre-defined players into the database
 * @param client
 * @returns {Promise<void>}
 */
async function createPlayers(client) {
    try {
        const database = client.db("TRBS");
        const collection = database.collection("player");
        // create a document to insert
        const playerDocuments =
            [
                {
                    UID:  0,
                    name: 'Karim',
                    maxHealth: 100,
                    health: 100,
                    speed: 81,
                    atk: 200,
                    dodge: 11,
                    experience: 0,
                    isDodging: 0,
                    type: "player",
                    itemsOwned: {},
                    skillsOwned: {"3": 0},
                    level: 1,
                    armor: 0,
                    inUse: false
                },
                {
                    UID:  1,
                    name: 'Antonio',
                    maxHealth: 80,
                    health: 80,
                    speed: 82,
                    atk: 15,
                    dodge: 9,
                    experience: 0,
                    isDodging: 0,
                    type: "player",
                    itemsOwned: {},
                    skillsOwned: {"4": 0, "0": 0, "1": 0, "6": 0},
                    level: 1,
                    armor: 0,
                    inUse: false
                },
                {
                    UID:  2,
                    name: 'Dion',
                    maxHealth: 90,
                    health: 90,
                    speed: 17,
                    atk: 10,
                    dodge: 6,
                    experience: 0,
                    isDodging: 0,
                    type: "player",
                    itemsOwned: {},
                    skillsOwned: {"5": 0, "2": 0},
                    level: 1,
                    armor: 0,
                    inUse: false
                },
                {
                    UID:  3,
                    name: 'Astrid',
                    maxHealth: 80,
                    health: 80,
                    speed: 17,
                    atk: 10,
                    dodge: 6,
                    experience: 0,
                    isDodging: 0,
                    type: "player",
                    itemsOwned: {},
                    skillsOwned: {"4": 0, "0": 0, "1": 0},
                    level: 1,
                    armor: 0,
                    inUse: false
                }
            ];


        await collection.insertMany(playerDocuments);
        //console.log(`A document was inserted with the _id: ${result.insertedId}`);
        console.log("Successfully migrated: players");
    } catch { console.log("Failed migration: players"); }
}

/**
 * This function inserts the pre-defined enemies into the database
 * @param client
 * @returns {Promise<void>}
 */
async function createEnemies(client) {
    try {
        const database = client.db("TRBS");
        const collection = database.collection("enemy");
        // create a document to insert
        const enemyDocuments =
            [
                {
                    "name": "Przeciwnik 1",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "human",
                    "health": 54,
                    "speed": 56,
                    "atk": 22,
                    "dodge": 9,
                    "zone": 8,
                    "armor": 1,
                    "maxHealth": 54,
                    "itemsOwned": {
                        "1": 0,
                        "2": 1,
                        "3": 1,
                        "4": 0,
                        "5": 1
                    }
                },
                {
                    "name": "Przeciwnik 2",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "monster",
                    "health": 59,
                    "speed": 71,
                    "atk": 12,
                    "dodge": 8,
                    "zone": 5,
                    "armor": 8,
                    "maxHealth": 59
                },
                {
                    "name": "Przeciwnik 3",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "monster",
                    "health": 55,
                    "speed": 44,
                    "atk": 11,
                    "dodge": 6,
                    "zone": 1,
                    "armor": 5,
                    "maxHealth": 55
                },
                {
                    "name": "Przeciwnik 4",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "monster",
                    "health": 50,
                    "speed": 62,
                    "atk": 20,
                    "dodge": 10,
                    "zone": 1,
                    "armor": 0,
                    "maxHealth": 50
                },
                {
                    "name": "Przeciwnik 5",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "human",
                    "health": 84,
                    "speed": 37,
                    "atk": 19,
                    "dodge": 7,
                    "zone": 6,
                    "armor": 0,
                    "maxHealth": 84,
                    "itemsOwned": {
                        "1": 1,
                        "2": 0,
                        "3": 0,
                        "4": 1,
                        "5": 1
                    }
                },
                {
                    "name": "Przeciwnik 6",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "human",
                    "health": 53,
                    "speed": 16,
                    "atk": 19,
                    "dodge": 7,
                    "zone": 4,
                    "armor": 3,
                    "maxHealth": 53,
                    "itemsOwned": {
                        "1": 0,
                        "2": 1,
                        "3": 0,
                        "4": 1,
                        "5": 1
                    }
                },
                {
                    "name": "Przeciwnik 7",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "monster",
                    "health": 87,
                    "speed": 48,
                    "atk": 15,
                    "dodge": 10,
                    "zone": 7,
                    "armor": 3,
                    "maxHealth": 87
                },
                {
                    "name": "Przeciwnik 8",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "human",
                    "health": 53,
                    "speed": 2,
                    "atk": 22,
                    "dodge": 9,
                    "zone": 10,
                    "armor": 1,
                    "maxHealth": 53,
                    "itemsOwned": {
                        "1": 1,
                        "2": 0,
                        "3": 1,
                        "4": 0,
                        "5": 1
                    }
                },
                {
                    "name": "Przeciwnik 9",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "monster",
                    "health": 59,
                    "speed": 78,
                    "atk": 18,
                    "dodge": 9,
                    "zone": 7,
                    "armor": 2,
                    "maxHealth": 59
                }
            ];
        await collection.insertMany(enemyDocuments);
        console.log("Successfully migrated: enemies");
    } catch { console.log("Failed migration: enemies"); }
}

/**
 * This function inserts the pre-defined items into the database
 * @param client
 * @returns {Promise<void>}
 */
async function createItems(client) {
    try {
        const database = client.db("TRBS");
        const collection = database.collection("item");
        // create a document to insert
        const itemDocuments = [
            {
                uiid: 1,
                displayName: "Flakon Życia",
                type: "healing",
                subtype: "restore",
                valueType: "flat",
                value: 10
            },
            {
                uiid: 2,
                displayName: "Mała Mikstura Życia",
                type: "healing",
                subtype: "restore",
                valueType: "flat",
                value: 15
            },
            {
                uiid: 3,
                displayName: "Mikstura Życia",
                type: "healing",
                subtype: "restore",
                valueType: "flat",
                value: 22
            },
            {
                uiid: 4,
                displayName: "Większa Mikstura Życia",
                type: "healing",
                subtype: "restore",
                valueType: "flat",
                value: 30
            },
            {
                uiid: 5,
                displayName: "Flakon Regeneracji",
                type: "healing",
                subtype: "revive",
                valueType: "parcentage",
                value: 0.50
            }
        ];
        await collection.insertMany(itemDocuments);
        console.log("Successfully migrated: items");
    } catch { console.log("Failed migration: items"); }
}

/**
 * This function inserts the pre-defined skills into the database
 * @param client
 * @returns {Promise<void>}
 */
async function createSkills(client) {
    try {
        const database = client.db("TRBS");
        const collection = database.collection("skill");
        // create a document to insert
        const skillDocuments = [
            {
                usid: 0,
                name: "Kumulacja",
                range: "individual",
                targetGroup: "player",
                type: "healing",
                subtype: "restore",
                value: 50,
                valueType: "flat",
                cooldown: 3,
                priority: 2
            },
            {
                usid: 1,
                name: "Hellfire",
                range: "everyone",
                targetGroup: "",
                type: "offensive",
                subtype: "damaging",
                value: 30,
                valueType: "flat",
                cooldown: 1,
                priority: 2
            },
            {
                usid: 2,
                name: "Przygrywka",
                range: "all",
                targetGroup: "player",
                type: "healing",
                subtype: "restore",
                value: 20,
                valueType: "flat",
                cooldown: 4,
                priority: 2
            },
            {
                usid: 3,
                name: "Próżnia",
                range: "all",
                targetGroup: "enemy",
                type: "offensive",
                subtype: "damaging",
                value: 80,
                valueType: "flat",
                cooldown: 2,
                priority: 3
            },
            {
                usid: 4,
                name: "Energy Ball",
                range: "individual",
                targetGroup: "reversed",
                type: "offensive",
                subtype: "damaging",
                value: 70,
                valueType: "flat",
                cooldown: 3,
                priority: 2
            },
            {
                usid: 5,
                name: "Wskrzeszenie",
                range: "individual",
                targetGroup: "player",
                type: "healing",
                subtype: "revive",
                value: 0.5,
                valueType: "percentage",
                cooldown: 4,
                priority: 3
            },
            {
                usid: 6,
                name: "Wielki Wybuch",
                range: "all",
                targetGroup: "reversed",
                type: "offensive",
                subtype: "damaging",
                value: 300,
                valueType: "flat",
                cooldown: 1,
                priority: 2
            }
        ];
        await collection.insertMany(skillDocuments);
        console.log("Successfully migrated: skills");
    } catch { console.log("Failed migration: skills"); }
}

/**
 * This function creates all collections in the database
 * @returns {Promise<void>}
 */
export async function migrateAll()
{
    let mongoClient;
    mongoClient = await connectToCluster();
    //get all collection names
    let collectionNames = [];
    await mongoClient.db("TRBS").listCollections().toArray().then(cols => {
        cols.map(col => collectionNames.push(col.name));
    });
    //check if the collection exists
    let playerCollectionExists = collectionNames.includes("player");
    let enemyCollectionExists = collectionNames.includes("enemy");
    let itemCollectionExists = collectionNames.includes("item");
    let skillCollectionExists = collectionNames.includes("skill");
    //if the collection does not exist, migrate it
    if(!playerCollectionExists) await createPlayers(mongoClient);
    if(!enemyCollectionExists) await createEnemies(mongoClient);
    if(!itemCollectionExists) await createItems(mongoClient);
    if(!skillCollectionExists) await createSkills(mongoClient);
    await mongoClient.close()
}

function getAvailablePlayers()
{
    var players = dbo.collection("players").find().toArray();
    return players;
}
