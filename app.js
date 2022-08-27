require("dotenv").config();
const express = require('express');
const app = express();
const port = 3000;

const chartRouter = require('./routes/charts');

app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded());

app.use('/api/charts', [chartRouter]);

app.get('/', (req, res) => {    
    res.send('hello Alphabet A');
});

app.listen(port, () => {    
    console.log(port, '포트로 서버가 켜졌어요!');
});