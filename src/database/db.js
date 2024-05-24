const pg = require('pg');
const dotenv = require('dotenv');
const crypto = require('crypto');
const NodeCache = require("node-cache");
const myCache = new NodeCache();
dotenv.config();

const clearCache = () => {
    myCache.flushAll();
    console.log('Cache cleared');
}


const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

// Generate all tables if they don't exist
pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        token VARCHAR(128),
        password VARCHAR(128),
        salt VARCHAR(32)
    );
`);

// Create a user
const createUser = async (name, email, password) => {
    // Generate a salt
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Hash the password with the salt
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    const lowerCaseEmail = email.toLowerCase();
    
    const query = {
        text: 'INSERT INTO users (name, email, password, salt) VALUES ($1, $2, $3, $4)',
        values: [name, lowerCaseEmail, hash, salt],
    }; 

    // error handling
    try {
        await pool.query(query);
        return "OK"
    } catch (error) {
        if (error.code === '23505') {
            // send error to the client
            return "User already exists"
        } else {
            throw error;
        }
    }
};

// Login with password and email
const loginWithPassword = async (email, password) => {
    // Convert email to lowercase
    email = email.toLowerCase();
    // Check cache first
    const cachedUser = myCache.get(email);
    if (cachedUser) {
        const hash = crypto.pbkdf2Sync(password, cachedUser.salt, 1000, 64, 'sha512').toString('hex');
        if (hash === cachedUser.password) {
            return cachedUser;
        }
    }

    // Retrieve user from the database by email
    const query = {
        text: 'SELECT * FROM users WHERE email = $1',
        values: [email],
    };
    
    const result = await pool.query(query);

    if (result.rows.length > 0) {
        const user = result.rows[0];
        // Hash the provided password with the stored salt and compare with the stored hash
        const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
        
        if (hash === user.password) {
            // Store user in cache
            myCache.set(email, user);
            return user;
        }
    }
    
    return null;
}

const getUserById = async (id) => {
    const query = {
        text: 'SELECT * FROM users WHERE id = $1',
        values: [id],
    };
    const result = await pool.query(query);
    if (result.rows.length > 0) {
        return result.rows[0];
    } else {
        return null;
    }
}

const saveToken = async (token, email) => {
    // generate a random string of 64 characters and save it in the database
    email = email.toLowerCase();
    const query = {
        text: 'UPDATE users SET token = $1 WHERE email = $2',
        values: [token, email],
    };
    const result = await pool.query(query);
    if (result.rowCount === 0) {
        throw new Error('No user found with the provided email');
    }
    return token;
};

const checkToken = async (token) => {
    const query = {
        text: 'SELECT * FROM users WHERE token = $1',
        values: [token],
    };
    const result = await pool.query(query);
    if (result.rows.length > 0) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    pool,
    createUser,
    loginWithPassword,
    clearCache,
    saveToken,
    checkToken,
    getUserById,
};
