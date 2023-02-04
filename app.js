import express from 'express';

import { config } from 'dotenv';
import { migrateAll } from './public/js/establish_db.js';
const app = express();
config();

app.use(express.static("public"));

app.listen(3000);

await migrateAll();