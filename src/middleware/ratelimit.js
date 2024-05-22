// my own rate limit middleware
const NodeCache = require('node-cache');

const cache = new NodeCache();

const rateLimit = (req, res, next) => {

    const req_limit = 5;

    const ip = req.ip;
    const currentRequests = cache.get(ip) || [];
    const remaining = Math.max(0, req_limit - currentRequests.length);
    const resetTime = currentRequests[0] ? new Date(currentRequests[0].getTime() + 60000) : new Date();

    res.setHeader('X-RateLimit-Limit', req_limit);
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.floor(resetTime.getTime() / 1000)));

    if (currentRequests.length >= req_limit) {
        return res.status(429).send('Too many requests');
    }
    cache.set(ip, [...currentRequests, new Date()], 60);
    next();
}

module.exports = rateLimit;
