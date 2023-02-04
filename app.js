import express from 'express';

import { config } from 'dotenv';
import { connectToCluster, migrateAll } from './public/js/establish_db.js';
const app = express();
config();

app.use(express.static("public"));

app.listen(3000);

await migrateAll();

let mc = await connectToCluster();

// console.log(db);

// app.get('/aplikacja/:app_id/', async (req, res, next) => {
app.get('/players/', async (req, res, next) => {
    const players = await mc.db("TRBS").collection("player").find().toArray();
    res.send(players);
});

// app.post('/participants/', async (req, res, next) => {
//     console.log(req.body);
//     // const players = await mc.db("TRBS").collection("player").find().toArray();
//     // res.send(players);
//   // res.cont = "casfsdgsdgs";
//   // res.send(req.params.app_id);
//   // res.sendStatus(200);
// });

app.put('/participants/:participant/:type', async (req, res, next) => {
    await mc.db("TRBS").collection(req.params.type).insertOne(JSON.parse(req.params.participant));
    res.sendStatus("200");
});
