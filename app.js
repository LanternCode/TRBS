import express from 'express';
import { config } from 'dotenv';
import { connectToCluster, migrateAll } from './public/js/establish_db.js';
import {ObjectId} from "mongodb";

//set up the server, config and initiate migrations
const app = express();
config();
await migrateAll();

//create a mongo client instance for later use
let mc = await connectToCluster();

//start the express server
app.use(express.static("public"));
app.listen(3000);

/**
 * API Call - Fetch all players from the player collection
 */
app.get('/players/', async (req, res, next) => {
    const players = await mc.db("TRBS").collection("player").find().toArray();
    res.send(players);
});

/**
 * API Call - Fetch all enemies from the enemy collection
 */
app.get('/enemies/', async (req, res, next) => {
    const enemies = await mc.db("TRBS").collection("enemy").find().toArray();
    res.send(enemies);
});

/**
 * API Call - Fetch all items from the item collection
 */
app.get('/items/', async (req, res, next) => {
    const items = await mc.db("TRBS").collection("item").find().toArray();
    res.send(items);
});

/**
 * API Call - Fetch all skills from the skill collection
 */
app.get('/skills/', async (req, res, next) => {
    const skills = await mc.db("TRBS").collection("skill").find().toArray();
    res.send(skills);
});

/**
 * API Call - Insert a new participant into player/enemy collection and return the _id
 */
app.put('/participants/:participant/:type', async (req, res, next) => {
    const newParticipantId = await mc.db("TRBS").collection(req.params.type).insertOne(JSON.parse(req.params.participant));
    res.send(newParticipantId.insertedId);
});

/**
 * API Call - Delete a player/enemy from the database
 */
app.delete('/dropParticipant/:participant/:type', async (req, res, next) => {
    let participant = JSON.parse(req.params.participant);
    participant._id = new ObjectId(participant._id);
    await mc.db("TRBS").collection(req.params.type).deleteOne({ "_id" : participant._id });
    res.sendStatus("200");
});

/**
 * API Call - Update a player/enemy in their corresponding collection
 */
app.put('/updateParticipant/:participant/:type', async (req, res, next) => {
    let participant = JSON.parse(req.params.participant);
    participant._id = new ObjectId(participant._id); //need to update in-system id for the replacement not to overwrite in-db ID
    await mc.db("TRBS").collection(req.params.type).replaceOne({ "_id" : participant._id }, participant);
    res.sendStatus("200");
});

/**
 * API Call - Increase player experience by 1 (called after battle ends with player victory)
 */
app.put('/grantExperience/:player', async (req, res, next) => {
    let participant = JSON.parse(req.params.player);
    participant._id = new ObjectId(participant._id);
    await mc.db("TRBS").collection("player").updateOne(
        { "_id" : participant._id },
        { $set: {"experience": (parseInt(participant.experience) + 1)} }
    );
    res.sendStatus("200");
});