const pg = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new pg.Pool
({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
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