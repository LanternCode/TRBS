import { config } from 'dotenv';
import { migrateAll } from './establish_db.js';

config({path: '../.env'});
await migrateAll();