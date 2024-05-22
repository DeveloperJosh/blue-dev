const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database/db');
const cookieParser = require("cookie-parser");

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

app.use('/api', require('./routes/api'));

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
    db.pool.query('SELECT NOW()', (error, results) => {
        if (error) {
            throw error;
        }
        console.log('PostgreSQL is connected');
    });
});