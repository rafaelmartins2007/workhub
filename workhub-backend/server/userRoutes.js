const express = require('express');
const router = express.Router();

const User = require('../data/users/user');
const verifyToken = require('./middleware/authMiddleware');

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
    }
    next();
};

// Suspender ou reativar conta
router.put('/:id/toggle', verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Utilizador não encontrado" });
        }

        // Alterna o estado
        user.ativo = !user.ativo;
        await user.save();

        res.json({
            message: `Conta do utilizador ${user.nome} foi ${user.ativo ? 'reativada' : 'suspensa'}`,
            ativo: user.ativo,
            user: {
                id: user._id,
                nome: user.nome,
                email: user.email,
                ativo: user.ativo
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Erro ao alterar estado da conta", error: error.message });
    }
});
// Listar todos os utilizadores (admin)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // não devolve as passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar utilizadores", error: error.message });
    }
});

module.exports = router;