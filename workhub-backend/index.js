const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config');

const hostname = '127.0.0.1';
const port = 3000;

var app = express();

// Middlewares da Aula 4 e Aula 6
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// Ligação ao MongoDB (exatamente como na Aula 5)
mongoose.connect(config.db)
    .then(() => console.log('Conexão MongoDB successful!'))
    .catch((err) => console.error('Erro na ligação:', err));

// Rota de teste (igual ao que fizemos nas aulas)
app.get('/', (req, res) => {
    res.send('WorkHub Backend a funcionar!');
});

const server = http.Server(app);

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});