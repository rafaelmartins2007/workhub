// server/index.js
const express = require('express');
const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;

const config = require('./config');
const mongoose = require('mongoose');

const router = require('./router');

var app = express();

// Middlewares (necessários)
app.use(express.json());

// Rotas
app.use('/api', router);

const server = http.Server(app);

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);

    mongoose.connect(config.db)
        .then(() => console.log('MongoDB ligado com sucesso!'))
        .catch((err) => console.error('Erro ao ligar ao MongoDB:', err));
});