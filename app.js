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
  // res.cont = "casfsdgsdgs";
  res.send(req.params.app_id);
  // res.sendStatus(200);
});
