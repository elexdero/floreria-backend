import pg from 'pg';
import {DB_HOST, DB_NAME, DB_PASS, DB_USER, DB_PORT} from './config.js';
 
const {Pool} = pg;

export const pool = new Pool({
    user: DB_USER,         
    password: DB_PASS,
    host: DB_HOST,         
    port: DB_PORT,         
    database: DB_NAME   
});