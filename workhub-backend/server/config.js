// server/config.js
const config = {
    db: "mongodb://127.0.0.1:27017/workhub",
    secret: "supersecret", 
    expiresPassword: 86400,   // 24 horas
    saltRounds: 10 
};

module.exports = config;