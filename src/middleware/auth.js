const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const db = require('../database/db');
dotenv.config();

const generateJWT = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        // 24 hours
        expiresIn: '24h',
    });
}

const authenticateUser = (req, res, next) => {
    // get token cookie from the request
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        req.user = user;
        next();
    });
};

module.exports = {
    generateJWT,
    authenticateUser,
}