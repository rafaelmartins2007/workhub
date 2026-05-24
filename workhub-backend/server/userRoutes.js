// server/userRoutes.js
const express = require('express');
const router = express.Router();

const User = require('../data/users/user');
const userService = require('../data/users');
const verifyToken = require('./middleware/authMiddleware');

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
    }
    next();
};

// ====================== ROTAS DO CLIENTE ======================

// Ver o próprio perfil
router.get('/me', verifyToken, (req, res) => {
    User.findById(req.user.id).select('-password')
        .then((user) => {
            if (!user) return res.status(404).json({ message: "Utilizador não encontrado" });
            res.json(user);
        })
        .catch((err) => {
            res.status(500).json({ message: "Erro ao carregar perfil", error: err.message });
        });
});

// Editar o próprio perfil (tem de vir ANTES do /:id)
router.put('/me', verifyToken, (req, res) => {
    const allowedFields = {};
    const fields = ['nome', 'contacto', 'morada', 'atividade', 'empresa'];

    fields.forEach((key) => {
        if (req.body[key] !== undefined) allowedFields[key] = req.body[key];
    });

    userService.update(req.user.id, allowedFields)
        .then((updatedUser) => {
            res.json({
                message: "Perfil atualizado com sucesso",
                user: updatedUser
            });
        })
        .catch((err) => {
            res.status(500).json({ message: "Erro ao atualizar perfil", error: err.message });
        });
});

// ====================== ROTAS DO ADMIN ======================

// Listar todos os utilizadores
router.get('/', verifyToken, isAdmin, (req, res) => {
    User.find({}, { password: 0 })
        .then((users) => res.json(users))
        .catch((err) => {
            res.status(500).json({ message: "Erro ao listar utilizadores", error: err.message });
        });
});

// Editar qualquer utilizador (Admin)
router.put('/:id', verifyToken, isAdmin, (req, res) => {
    userService.update(req.params.id, req.body)
        .then((updatedUser) => {
            res.json({ message: "Utilizador atualizado com sucesso", user: updatedUser });
        })
        .catch((err) => {
            if (err.message && err.message.includes("E11000")) {
                return res.status(400).json({ message: "Email ou NIF já está em uso por outro utilizador" });
            }
            res.status(500).json({ message: "Erro ao atualizar utilizador", error: err.message });
        });
});

// Suspender / Reativar conta
router.put('/:id/toggle', verifyToken, isAdmin, (req, res) => {
    User.findById(req.params.id)
        .then((user) => {
            if (!user) return res.status(404).json({ message: "Utilizador não encontrado" });
            user.ativo = !user.ativo;
            return user.save().then(() => {
                res.json({
                    message: `Conta ${user.ativo ? 'reativada' : 'suspensa'} com sucesso`,
                    ativo: user.ativo,
                    user: { id: user._id, nome: user.nome, email: user.email, ativo: user.ativo }
                });
            });
        })
        .catch((err) => {
            res.status(500).json({ message: "Erro ao alterar estado da conta", error: err.message });
        });
});

module.exports = router;