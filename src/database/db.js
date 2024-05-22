const { Pool } = require('pg');
const dotenv = require('dotenv');
const pool = new Pool
({
    user: 'postgres',
    host: process.env.DB_HOST,
    database: 'node',
    password: process.env.DB_PASS,
    port: 5432,
});

// log the connection status
pool.on('connect', () => {
    console.log('connected to the db');
});

const getTime = () => {
    return new Date().toLocaleString();
};

module.exports = {
    pool,
    getTime,
};