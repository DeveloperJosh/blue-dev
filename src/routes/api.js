// api route for the app
// Path: src/routes/api.js
// Compare this snippet from src/index.js:
const express = require('express');
const db = require('../database/db');
const auth = require('../middleware/auth');
const rateLimit = require('../middleware/ratelimit');
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
    const token = auth.generateJWT(req.body.email);

    // save token in cookie
    res.cookie(
        'token',
        token,
        {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
        }
    )

    return res.status(200).json({ message: 'Logged in', "token": token });
});

// logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logged out' });
});

router.get('/test', auth.authenticateUser, (req, res) => {
    return res.status(200).json({ message: 'You are authenticated' });
});

module.exports = router;