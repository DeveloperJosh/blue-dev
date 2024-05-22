// api route for the app
// Path: src/routes/api.js
// Compare this snippet from src/index.js:
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: 'API - 👋🌍🌏🌎'
    });
});

module.exports = router;