const express = require('express');
const ejs = require('ejs');
const port = 3000;

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.send('Hello world!');
})

app.listen(port, () => {
    console.log(`Listening on port ${port}... `);
})