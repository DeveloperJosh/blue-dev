// api route for the app
// Path: src/routes/api.js
// Compare this snippet from src/index.js:
const express = require('express');
const db = require('../database/db');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: db.getTime(),
    });
});

module.exports = router;