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
// Cliente edita o próprio perfil (tem de vir ANTES do /:id)
router.put('/me', verifyToken, async (req, res) => {
    try {
        const allowedFields = {
            nome: req.body.nome,
            contacto: req.body.contacto,
            morada: req.body.morada,
            atividade: req.body.atividade,
            empresa: req.body.empresa
        };

        // Remove campos que não foram enviados
        Object.keys(allowedFields).forEach(key => {
            if (allowedFields[key] === undefined) delete allowedFields[key];
        });

        const updatedUser = await userService.update(req.user.id, allowedFields);

        res.json({
            message: "Perfil atualizado com sucesso",
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            message: "Erro ao atualizar perfil",
            error: error.message
        });
    }
});

// ====================== ROTAS DO ADMIN ======================
// Listar todos os utilizadores
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar utilizadores", error: error.message });
    }
});

// Editar qualquer utilizador (Admin) - agora vem DEPOIS do /me
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const updatedUser = await userService.update(req.params.id, req.body);

        res.json({
            message: "Utilizador atualizado com sucesso",
            user: updatedUser
        });
    } catch (error) {
        if (error.message.includes("E11000")) {
            return res.status(400).json({ message: "Email ou NIF já está em uso por outro utilizador" });
        }
        res.status(500).json({
            message: "Erro ao atualizar utilizador",
            error: error.message
        });
    }
});

// Suspender / Reativar conta
router.put('/:id/toggle', verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Utilizador não encontrado" });

        user.ativo = !user.ativo;
        await user.save();

        res.json({
            message: `Conta ${user.ativo ? 'reativada' : 'suspensa'} com sucesso`,
            ativo: user.ativo,
            user: { id: user._id, nome: user.nome, email: user.email, ativo: user.ativo }
        });
    } catch (error) {
        res.status(500).json({ message: "Erro ao alterar estado da conta", error: error.message });
    }
});

module.exports = router;