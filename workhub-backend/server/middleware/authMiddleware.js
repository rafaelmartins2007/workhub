// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const config = require('../config');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];   // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: "Token não fornecido. Faça login primeiro." });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido ou expirado." });
        }

        req.user = decoded;   // guarda id, email e role para usar depois
        next();
    });
};

module.exports = verifyToken;