const pg = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new pg.Pool
({
    user: 'postgres',
    host: process.env.DB_HOST,
    database: 'node',
    password: process.env.DB_PASS,
    port: 5433,
});

// gen all tables if they don't exist
pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100),
        password VARCHAR(100)
    );

    CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100),
        likes INT,
        content TEXT,
        user_id INT REFERENCES users(id)
    );
`);

module.exports = {
    pool,
};