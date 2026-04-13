// server/config.js
const config = {
    db: "mongodb://127.0.0.1:27017/workhub",
    secret: "workhub_super_secret_2026_muda_isto_na_producao", 
    expiresPassword: 86400,   // 24 horas
    saltRounds: 10
};

module.exports = config;