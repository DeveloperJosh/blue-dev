// Path: src/routes/api.js
const express = require('express');
const db = require('../database/db');
const auth = require('../middleware/auth');
const rateLimit = require('../middleware/ratelimit');
const router = express.Router();

// Render the home page
router.get('/', (req, res) => {
    return res.render('index');
});

// Render the signup page
router.get('/signup', (req, res) => {
    return res.render('signup');
});

// Render the login page
router.get('/login', (req, res) => {
    return res.render('login');
});

// Create a user
router.post('/create', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await db.createUser(username, email, password);
        return res.status(201).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating user', error });
    }
});

// User login
router.post('/user', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const user = await db.loginWithPassword(email, password);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = auth.generateJWT(user);

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
        });

        return res.status(200).json({ message: 'Logged in', token, userId: user.id });
    } catch (error) {
        return res.status(500).json({ message: 'Error logging in', error });
    }
});

router.get('/user/:id', auth.authenticateUser, async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10); // Convert userId to a number

        // Log the types for debugging
        console.log(typeof userId, userId, typeof req.user.id, req.user.id);

        // Check if the user id is the same as the authenticated user id
        if (userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const user = await db.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving user data', error });
    }
});


// User logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logged out' });
});

// Test authentication
router.get('/test', auth.authenticateUser, (req, res) => {
    return res.status(200).json({ message: 'You are authenticated' });
});

module.exports = router;
