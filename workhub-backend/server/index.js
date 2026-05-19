// server/index.js
const express = require('express');
const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;

// Configurações e dependências
const config = require('./config');
const mongoose = require('mongoose');

// Importa o router principal
const router = require('./router');
var app = express();

// Middleware global: interpreta o body dos pedidos HTTP como JSON.
app.use(express.json());

// Todas as rotas da API estão acessíveis sob /api
app.use('/api', router);

// Cria o servidor HTTP usando a app do Express
const server = http.Server(app);

// Inicia o servidor na porta e hostname definidos
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);

    // Liga-se ao MongoDB depois do servidor estar a correr
    mongoose.connect(config.db)
        .then(() => console.log('MongoDB ligado com sucesso!'))
        .catch((err) => console.error('Erro ao ligar ao MongoDB:', err));
});