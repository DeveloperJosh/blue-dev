// api route for the app
// Path: src/routes/api.js
// Compare this snippet from src/index.js:
const express = require('express');
const db = require('../database/db');
const auth = require('../middleware/auth');
const router = express.Router();

//get time from the database
router.get('/', (req, res) => {
    db.pool.query('SELECT NOW()', (error, results) => {
        if (error) {
            throw error;
        }
        return res.status(200).json(results.rows);
    });
});

// create a user
router.post('/user', async (req, res) => {
    const { username, email, password } = req.body;
    const user = await db.createUser(username, email, password);
    return res.status(201).json({ message: user });
});

// login GET /user
router.get('/user', async (req, res) => {
    const user = await db.loginWithPassword(req.body.email, req.body.password);

    //check if password is correct
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    // gen token
    const token = auth.generateToken(req.body.email);

    // add token to cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });

    // log cookie
    console.log(req.cookies);
    return res.status(200).json({ message: 'User logged in' });
});

// test token   
router.get('/test', auth.authenticateToken, (req, res) => {
    return res.status(200).json({ message: 'Token is valid' });
});

module.exports = router;