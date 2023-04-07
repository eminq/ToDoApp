const express = require('express');
const ejs = require('ejs');
const ejsMate = require('ejs-mate'); // this is for layouts partials ..
const path = require('path');
const port = 3000;

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('home');
})

app.listen(port, () => {
    console.log(`Listening on port ${port}... `);
})