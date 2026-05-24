// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../../data/users/user');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token não fornecido. Faça login." });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido ou expirado." });
        }

        User.findById(decoded.id).select('ativo role')
            .then((user) => {
                if (!user) {
                    return res.status(404).json({ message: "Utilizador não encontrado." });
                }
                if (!user.ativo) {
                    return res.status(403).json({ message: "Conta suspensa. Contacte o administrador." });
                }
                req.user = decoded;
                req.user.ativo = user.ativo;
                req.user.role = user.role;
                next();
            })
            .catch((err) => {
                res.status(500).json({ message: "Erro ao verificar token.", error: err.message });
            });
    });
};

module.exports = verifyToken;