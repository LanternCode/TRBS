import { MongoClient } from 'mongodb';

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
        const playerDocuments =
            [
                {
                    name: 'Karim',
                    maxHealth: 100,
                    health: 100,
                    speed: 81,
                    attack: 200,
                    dodge: 11,
                    experience: 0,
                    isDodging: 0,
                    type: "player",
                    itemsOwned: {},
                    skillsOwned: {"3": 0, "11": 0},
                    level: 1,
                    armor: 0,
                    inUse: false,
                    statusesApplied: []
                },
                {
                    name: 'Antonio',
                    maxHealth: 80,
                    health: 80,
                    speed: 82,
                    attack: 15,
                    dodge: 9,
                    experience: 0,
                    isDodging: 0,
                    type: "player",
                    itemsOwned: {},
                    skillsOwned: {"4": 0, "0": 0, "1": 0, "6": 0, "11": 0, "12": 0, "13": 0, "14": 0, "15": 0},
                    level: 1,
                    armor: 0,
                    inUse: false,
                    statusesApplied: []
                },
                {
                    name: 'Dion',
                    maxHealth: 90,
                    health: 90,
                    speed: 17,
                    attack: 10,
                    dodge: 6,
                    experience: 0,
                    isDodging: 0,
                    type: "player",
                    itemsOwned: {},
                    skillsOwned: {"5": 0, "2": 0, "11": 0},
                    level: 1,
                    armor: 0,
                    inUse: false,
                    statusesApplied: []
                },
                {
                    name: 'Astrid',
                    maxHealth: 80,
                    health: 80,
                    speed: 17,
                    attack: 10,
                    dodge: 6,
                    experience: 0,
                    isDodging: 0,
                    type: "player",
                    itemsOwned: {"1": 1, "2": 1, "3": 1, "4": 1, "5": 1, "6": 2, "7": 2, "8": 2, "9": 2},
                    skillsOwned: {"6": 0, "7": 0, "8": 0, "9": 0, "10": 0, "11": 0},
                    level: 1,
                    armor: 0,
                    inUse: false,
                    statusesApplied: []
                }
            ];


        await collection.insertMany(playerDocuments);
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
                    "attack": 22,
                    "dodge": 9,
                    "zone": 8,
                    "armor": 1,
                    "maxHealth": 54,
                    "skillsOwned": {"7": 0, "11": 0, "16": 0},
                    "itemsOwned": {
                        "1": 0,
                        "2": 1,
                        "3": 1,
                        "4": 0,
                        "5": 1
                    },
                    "statusesApplied": []
                },
                {
                    "name": "Przeciwnik 2",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "monster",
                    "health": 59,
                    "speed": 71,
                    "attack": 12,
                    "dodge": 8,
                    "zone": 5,
                    "armor": 8,
                    "maxHealth": 59,
                    "skillsOwned": {"8": 0, "11": 0, "16": 0},
                    "statusesApplied": []
                },
                {
                    "name": "Przeciwnik 3",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "monster",
                    "health": 55,
                    "speed": 44,
                    "attack": 11,
                    "dodge": 6,
                    "zone": 1,
                    "armor": 5,
                    "maxHealth": 55,
                    "skillsOwned": {"9": 0, "11": 0},
                    "statusesApplied": []
                },
                {
                    "name": "Przeciwnik 4",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "monster",
                    "health": 50,
                    "speed": 62,
                    "attack": 20,
                    "dodge": 10,
                    "zone": 1,
                    "armor": 0,
                    "maxHealth": 50,
                    "statusesApplied": []
                },
                {
                    "name": "Przeciwnik 5",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "human",
                    "health": 84,
                    "speed": 37,
                    "attack": 19,
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
                    },
                    "statusesApplied": []
                },
                {
                    "name": "Przeciwnik 6",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "human",
                    "health": 53,
                    "speed": 16,
                    "attack": 19,
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
                    },
                    "statusesApplied": []
                },
                {
                    "name": "Przeciwnik 7",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "monster",
                    "health": 87,
                    "speed": 48,
                    "attack": 15,
                    "dodge": 10,
                    "zone": 7,
                    "armor": 3,
                    "maxHealth": 87,
                    "statusesApplied": []
                },
                {
                    "name": "Przeciwnik 8",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "human",
                    "health": 53,
                    "speed": 2,
                    "attack": 22,
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
                    },
                    "statusesApplied": []
                },
                {
                    "name": "Przeciwnik 9",
                    "isDodging": 0,
                    "type": "enemy",
                    "subtype": "monster",
                    "health": 59,
                    "speed": 78,
                    "attack": 18,
                    "dodge": 9,
                    "zone": 7,
                    "armor": 2,
                    "maxHealth": 59,
                    "statusesApplied": []
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
                value: 10,
                statusesApplied: []
            },
            {
                uiid: 2,
                displayName: "Mała Mikstura Życia",
                type: "healing",
                subtype: "restore",
                valueType: "flat",
                value: 15,
                statusesApplied: []
            },
            {
                uiid: 3,
                displayName: "Mikstura Życia",
                type: "healing",
                subtype: "restore",
                valueType: "flat",
                value: 22,
                statusesApplied: []
            },
            {
                uiid: 4,
                displayName: "Większa Mikstura Życia",
                type: "healing",
                subtype: "restore",
                valueType: "flat",
                value: 30,
                statusesApplied: []
            },
            {
                uiid: 5,
                displayName: "Flakon Regeneracji",
                type: "healing",
                subtype: "revive",
                valueType: "parcentage",
                value: 0.50,
                statusesApplied: []
            },
            {
                uiid: 6,
                displayName: "Eliksir Czerwonofurii",
                type: "statModifier",
                subtype: "self",
                valueType: "",
                value: 0,
                statusesApplied: ["damageBoost"]
            },
            {
                uiid: 7,
                displayName: "Eliksir Wiatrozieleni",
                type: "statModifier",
                subtype: "self",
                valueType: "",
                value: 0,
                statusesApplied: ["dodgeBoost"]
            },
            {
                uiid: 8,
                displayName: "Eliksir Białocyklonu",
                type: "statModifier",
                subtype: "self",
                valueType: "",
                value: 0,
                statusesApplied: ["speedBoost"]
            },
            {
                uiid: 9,
                displayName: "Napar Oczyszczający",
                type: "statusRemover",
                subtype: "self",
                valueType: "",
                value: 0,
                statusesApplied: []
            }
        ];
        await collection.insertMany(itemDocuments);
        console.log("Successfully migrated: items");
    } catch { console.log("Failed migration: items"); }
}

/**
 * This function inserts the pre-defined skills into the database.
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
                subtype: "damage",
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
                subtype: "damage",
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
                subtype: "damage",
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
                subtype: "damage",
                value: 300,
                valueType: "flat",
                cooldown: 1,
                priority: 2
            },
            {
                usid: 7,
                name: "Zatruta Igła",
                range: "individual",
                targetGroup: "reversed",
                type: "offensive",
                subtype: "damage",
                value: 15,
                valueType: "flat",
                cooldown: 3,
                priority: 2,
                statusesApplied: ["poison"]
            },
            {
                usid: 8,
                name: "Iskierka",
                range: "individual",
                targetGroup: "reversed",
                type: "offensive",
                subtype: "damage",
                value: 0,
                valueType: "flat",
                cooldown: 3,
                priority: 2,
                statusesApplied: ["ignite"]
            },
            {
                usid: 9,
                name: "Szarpiące Uderzenie",
                range: "individual",
                targetGroup: "reversed",
                type: "offensive",
                subtype: "damage",
                value: 20,
                valueType: "flat",
                cooldown: 3,
                priority: 2,
                statusesApplied: ["bleed"]
            },
            {
                usid: 10,
                name: "Regenerujący Deszcz",
                range: "all",
                targetGroup: "player",
                type: "healing",
                subtype: "restore",
                value: 0,
                valueType: "flat",
                cooldown: 4,
                priority: 2,
                statusesApplied: ["regeneration"]
            },
            {
                usid: 11,
                name: "Się Kręci Kręci Kręci",
                range: "individual",
                targetGroup: "reversed",
                type: "offensive",
                subtype: "damage",
                value: 10,
                valueType: "flat",
                cooldown: 3,
                priority: 2,
                statusesApplied: ["confusion"]
            },
            {
                usid: 12,
                name: "Błogosławieństwo Impaktu",
                range: "individual",
                targetGroup: "player",
                type: "support",
                subtype: "status",
                value: 0,
                valueType: "flat",
                cooldown: 3,
                priority: 3,
                statusesApplied: ["impact"]
            },
            {
                usid: 13,
                name: "Błogo. Dodatkowego Ataku",
                range: "individual",
                targetGroup: "player",
                type: "support",
                subtype: "status",
                value: 0,
                valueType: "flat",
                cooldown: 3,
                priority: 3,
                statusesApplied: ["extraAttack"]
            },
            {
                usid: 14,
                name: "Błogo. Furii",
                range: "individual",
                targetGroup: "player",
                type: "support",
                subtype: "status",
                value: 0,
                valueType: "flat",
                cooldown: 3,
                priority: 3,
                statusesApplied: ["fury"]
            },
            {
                usid: 15,
                name: "Błogo. Perfekcji",
                range: "individual",
                targetGroup: "player",
                type: "support",
                subtype: "status",
                value: 0,
                valueType: "flat",
                cooldown: 3,
                priority: 3,
                statusesApplied: ["perfection"]
            },
            {
                usid: 16,
                name: "Szarpanie Pazurami",
                range: "individual",
                targetGroup: "reversed",
                type: "offensive",
                subtype: "damage",
                value: 20,
                valueType: "flat",
                cooldown: 3,
                priority: 2,
                statusesApplied: ["shrapnel"]
            }
        ];
        await collection.insertMany(skillDocuments);
        console.log("Successfully migrated: skills");
    } catch { console.log("Failed migration: skills"); }
}

/**
 * This function inserts the pre-defined statuses into the database.
 * @param client
 * @returns {Promise<void>}
 */
async function createStatuses(client) {
    try {
        const database = client.db("TRBS");
        const collection = database.collection("status");
        // create a document to insert
        const statusDocuments = [
            {
                ustid: 0,
                name: "poison",
                displayName: "Zatrucie",
                description: "Na końcu tury uczestnika zadaje obrażenia domeny zatrucia.",
                effectiveAt: "end",
                effectiveTurn: "local",
                type: "damage",
                strengthType: "flat",
                defaultLength: 3,
                length: 0,
                defaultStrength: 8,
                strength: 0,
                statsAffectedList: [],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: true,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 1,
                name: "ignite",
                displayName: "Podpalenie",
                description: "Na początku tury uczestnika zadaje obrażenia domeny ognia.",
                effectiveAt: "start",
                effectiveTurn: "local",
                type: "damage",
                strengthType: "flat",
                defaultLength: 3,
                length: 0,
                defaultStrength: 9,
                strength: 0,
                statsAffectedList: [],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: true,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 2,
                name: "bleed",
                displayName: "Krwawienie",
                description: "Na końcu tury uczestnik wykrwawia się i otrzymuje obrażenia.",
                effectiveAt: "end",
                effectiveTurn: "local",
                type: "damage",
                strengthType: "flat",
                defaultLength: 3,
                length: 0,
                defaultStrength: 10,
                strength: 0,
                statsAffectedList: [],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: true,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 3,
                name: "slow",
                displayName: "Spowolnienie",
                description: "Szybkość uczestnika jest zmniejszona.",
                effectiveAt: "end",
                effectiveTurn: "global",
                type: "statModifier",
                strengthType: "flat",
                defaultLength: 3,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [
                    {
                        stat: "speed",
                        val: -15,
                        valType: "flat"
                    }
                ],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 4,
                name: "speedBoost",
                displayName: "Przyspieszenie",
                description: "Szybkość uczestnika jest zwiększona.",
                effectiveAt: "end",
                effectiveTurn: "global",
                type: "statModifier",
                strengthType: "flat",
                defaultLength: 3,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [
                    {
                        stat: "speed",
                        val: 25,
                        valType: "flat"
                    }
                ],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 5,
                name: "damageBoost",
                displayName: "Zwiększony Atak",
                description: "Atak uczestnika jest zwiększony.",
                effectiveAt: "end",
                effectiveTurn: "global",
                type: "statModifier",
                strengthType: "flat",
                defaultLength: 3,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [
                    {
                        stat: "attack",
                        val: 6,
                        valType: "flat"
                    }
                ],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 6,
                name: "dodgeBoost",
                displayName: "Zwiększony Unik",
                description: "Unik uczestnika jest zwiększony.",
                effectiveAt: "end",
                effectiveTurn: "global",
                type: "statModifier",
                strengthType: "flat",
                defaultLength: 3,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [
                    {
                        stat: "dodge",
                        val: 5,
                        valType: "flat"
                    }
                ],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 7,
                name: "regeneration",
                displayName: "Regeneracja",
                description: "Na początku tury uczestnik odzyskuje zdrowie.",
                effectiveAt: "start",
                effectiveTurn: "local",
                type: "restore",
                strengthType: "flat",
                defaultLength: 3,
                length: 0,
                defaultStrength: 15,
                strength: 0,
                statsAffectedList: [],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 8,
                name: "extraAttack",
                displayName: "Dodatkowy Atak",
                description: "Uczestnik może wykonać dodatkową akcję priorytetu 2.",
                effectiveAt: "onAct",
                effectiveTurn: "persistent",
                type: "damage",
                strengthType: "",
                defaultLength: 1,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 9,
                name: "impact",
                displayName: "Impakt",
                description: "Uczestnik zadaje dwukrotnie zwiększone obrażenia jeśli jego zdrowie jest mniejsze od połowy, oraz ponownie podwójnie" +
                    " zwiększone jeśli zdrowie jego celu jest mniejsze od połowy.",
                effectiveAt: "onDamage",
                effectiveTurn: "persistent",
                type: "damage",
                strengthType: "",
                defaultLength: 1,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 10,
                name: "perfection",
                displayName: "Perfekcja",
                description: "Następny atak tego celu będzie sukcesem i nie może zostać uniknięty (może zostać zablokowany)",
                effectiveAt: "onHit",
                effectiveTurn: "persistent",
                type: "damage",
                strengthType: "",
                defaultLength: 1,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 11,
                name: "shrapnel",
                displayName: "Poszarpanie",
                description: "Efekty lecznicze oddziałujące na uczestnika są zmniejszone o połowę.",
                effectiveAt: "onRestoreHp",
                effectiveTurn: "global",
                type: "damage",
                strengthType: "",
                defaultLength: 3,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 12,
                name: "fury",
                displayName: "Furia",
                description: "Uczestnik który jako jedyny ze swojej drużyny pozostał na polu walki odzyskuje natychmiast część swojego zdrowia" +
                    " a jego obrażenia są zwiększone.",
                effectiveAt: "onDeath",
                effectiveTurn: "persistent",
                type: "statModifier",
                strengthType: "",
                defaultLength: 3,
                length: 0,
                defaultStrength: 30,
                strength: 0,
                statsAffectedList: [
                    {
                        stat: "attack",
                        val: 10,
                        valType: "flat"
                    }
                ],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: false
            },
            {
                ustid: 13,
                name: "confusion",
                displayName: "Zawirowanie",
                description: "Cel akcji uczestnika jest wybierany losowo.",
                effectiveAt: "onAct",
                effectiveTurn: "persistent",
                type: "damage",
                strengthType: "",
                defaultLength: 2,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 14,
                name: "deepWounds",
                displayName: "Głębokie Rany",
                description: "Cel otrzymuje zwiększone obrażenia.",
                effectiveAt: "onDamage",
                effectiveTurn: "persistent",
                type: "damage",
                strengthType: "",
                defaultLength: 3,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 15,
                name: "bombDebuff",
                displayName: "Bomba",
                description: "Do celu przyczepiono bombę...",
                effectiveAt: "onStartTurn",
                effectiveTurn: "persistent",
                type: "damage",
                strengthType: "",
                defaultLength: 3,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [],
                statusClearable: false,
                lastUntilCleared: false,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 16,
                name: "illusion",
                displayName: "Iluzja",
                description: "Tylko osoby zaatakowane przez ten cel mogą go atakować.",
                effectiveAt: "onHit",
                effectiveTurn: "persistent",
                type: "damage",
                strengthType: "",
                defaultLength: 3,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [],
                statusClearable: false,
                lastUntilCleared: true,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 17,
                name: "object",
                displayName: "Obiekt",
                description: "Obiekty nie mogą atakować.",
                effectiveAt: "onAct",
                effectiveTurn: "persistent",
                type: "damage",
                strengthType: "",
                defaultLength: 0,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [],
                statusClearable: false,
                lastUntilCleared: true,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 18,
                name: "permadeath",
                displayName: "Perma-Death",
                description: "Efekty Ożywiające nie działają na ten cel.",
                effectiveAt: "onRestoreHp",
                effectiveTurn: "persistent",
                type: "damage",
                strengthType: "",
                defaultLength: 0,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [],
                statusClearable: false,
                lastUntilCleared: true,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 19,
                name: "statusResistance",
                displayName: "Odporność na statusy",
                description: "Ten cel jest odporny na działanie statusów.",
                effectiveAt: "onApplyStatus",
                effectiveTurn: "persistent",
                type: "damage",
                strengthType: "",
                defaultLength: 3,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [],
                statusClearable: false,
                lastUntilCleared: false,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 20,
                name: "instantEscape",
                displayName: "Natychmiastowa Ucieczka",
                description: "Podejmując ucieczkę z walki, cel zawsze ucieknie.",
                effectiveAt: "onEscape",
                effectiveTurn: "persistent",
                type: "other",
                strengthType: "",
                defaultLength: 1,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            },
            {
                ustid: 21,
                name: "instantEscape",
                displayName: "Natychmiastowa Ucieczka",
                description: "Podejmując ucieczkę z walki, cel zawsze ucieknie.",
                effectiveAt: "onEscape",
                effectiveTurn: "persistent",
                type: "other",
                strengthType: "",
                defaultLength: 1,
                length: 0,
                defaultStrength: 0,
                strength: 0,
                statsAffectedList: [],
                statusClearable: true,
                lastUntilCleared: false,
                useDefaultStrengthSource: false,
                applyStatsAffectedImmediately: true
            }
        ];
        await collection.insertMany(statusDocuments);
        console.log("Successfully migrated: statuses");
    } catch { console.log("Failed migration: statuses"); }
}

/**
 * This function creates all mandatory collections in the database
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
    let statusCollectionExists = collectionNames.includes("status");
    //if the collection does not exist, migrate it
    if(!playerCollectionExists) await createPlayers(mongoClient);
    if(!enemyCollectionExists) await createEnemies(mongoClient);
    if(!itemCollectionExists) await createItems(mongoClient);
    if(!skillCollectionExists) await createSkills(mongoClient);
    if(!statusCollectionExists) await createStatuses(mongoClient);
    await mongoClient.close()
}
