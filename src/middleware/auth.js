const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        // 24 hours
        expiresIn: '24h',
    });
}

const authenticateToken = (req, res, next) => {
    // get jwt from cookie  
    const token = req.cookies.token;
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = {
    generateToken,
    authenticateToken,
}