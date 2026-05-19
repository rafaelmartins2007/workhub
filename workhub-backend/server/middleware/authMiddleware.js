// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../../data/users/user');   // ← importante

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token não fornecido. Faça login." });
    }

    jwt.verify(token, config.secret, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido ou expirado." });
        }

        // Busca o utilizador completo na BD para verificar se está ativo
        const user = await User.findById(decoded.id).select('ativo role');
        
        if (!user) {
            return res.status(404).json({ message: "Utilizador não encontrado." });
        }

        if (!user.ativo) {
            return res.status(403).json({ 
                message: "Conta suspensa. Contacte o administrador." 
            });
        }

        // Guarda informação completa no request
        req.user = decoded;
        req.user.ativo = user.ativo;
        req.user.role = user.role;

        next();
    });
};

module.exports = verifyToken;