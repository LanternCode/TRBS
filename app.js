import express from 'express';

import { config } from 'dotenv';
import { connectToCluster, migrateAll } from './public/js/establish_db.js';
const app = express();
config();

app.use(express.static("public"));

app.listen(3000);

await migrateAll();

let mc = await connectToCluster();

app.get('/players/', async (req, res, next) => {
    const players = await mc.db("TRBS").collection("player").find().toArray();
    res.send(players);
});

app.put('/participants/:participant/:type', async (req, res, next) => {
    await mc.db("TRBS").collection(req.params.type).insertOne(JSON.parse(req.params.participant));
    res.sendStatus("200");
});

app.get('/enemies/', async (req, res, next) => {
    const enemies = await mc.db("TRBS").collection("enemy").find().toArray();
    res.send(enemies);
    res.send(req.params.app_id);
});

app.get('/items/', async (req, res, next) => {
    const items = await mc.db("TRBS").collection("item").find().toArray();
    res.send(items);
    res.send(req.params.app_id);
});

app.get('/skills/', async (req, res, next) => {
    const skills = await mc.db("TRBS").collection("skill").find().toArray();
    res.send(skills);
    res.send(req.params.app_id);
});

app.put('/insertParticipant/:participant&:type', async (req, res, next) => {
    await mc.db("TRBS").collection(req.params.type).insertOne(req.params.participant);
    res.sendStatus("200");
});