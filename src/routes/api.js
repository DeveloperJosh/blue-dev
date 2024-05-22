// api route for the app
// Path: src/routes/api.js
// Compare this snippet from src/index.js:
const express = require('express');
const db = require('../database/db');
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

module.exports = router;