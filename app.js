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
 * API Call - Fetch all spells from the spell collection
 */
app.get('/spells/', async (req, res, next) => {
    const spells = await mc.db("TRBS").collection("spell").find().toArray();
    res.send(spells);
});

/**
 * API Call - Fetch all statuses from the status collection
 */
app.get('/statuses/', async (req, res, next) => {
    const statuses = await mc.db("TRBS").collection("status").find().toArray();
    res.send(statuses);
});

/**
 * API Call - Insert a new participant into player/enemy collection and return the _id
 */
app.put('/participants/:participant/:type', async (req, res, next) => {
    const newParticipantId = await mc.db("TRBS").collection(req.params.type).insertOne(JSON.parse(req.params.participant));
    res.send(newParticipantId.insertedId);
});

/**
 * API Call - Insert a new status into status collection and return the _id
 */
app.put('/statuses/:statusToInsert/', async (req, res, next) => {
    const newStatusId = await mc.db("TRBS").collection("status").insertOne(JSON.parse(req.params.statusToInsert));
    res.send(newStatusId.insertedId);
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
 * API Call - Delete a status from the database
 */
app.delete('/dropStatus/:statusToDrop/', async (req, res, next) => {
    let statusToDrop = JSON.parse(req.params.statusToDrop);
    statusToDrop._id = new ObjectId(statusToDrop._id);
    await mc.db("TRBS").collection("status").deleteOne({ "_id" : statusToDrop._id });
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
 * API Call - Update a status in the status collection
 */
app.put('/updateStatus/:statusToUpdate/', async (req, res, next) => {
    let statusToUpdate = JSON.parse(req.params.statusToUpdate);
    statusToUpdate._id = new ObjectId(statusToUpdate._id);
    await mc.db("TRBS").collection("status").replaceOne({ "_id" : statusToUpdate._id }, statusToUpdate);
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