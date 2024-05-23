const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database/db');
const cookieParser = require("cookie-parser");

setInterval(db.clearCache, 24 * 60 * 60 * 1000);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});
app.set('view engine', 'ejs');
app.enable('trust proxy')
app.use(express.static(__dirname + '/public'));

app.use('/', require('./routes/api'));

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
    db.pool.query('SELECT NOW()', (error, results) => {
        if (error) {
            throw error;
        }
        console.log('PostgreSQL is connected');
    });
});