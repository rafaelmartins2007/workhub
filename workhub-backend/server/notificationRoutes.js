// server/notificationRoutes.js
const express = require('express');
const router = express.Router();

// Importa o serviço que contém a lógica das notificações
const notificationService = require('../data/notifications');

// Middleware de autenticação (verifica o token JWT)
const verifyToken = require('./middleware/authMiddleware');

// Middleware simples para verificar se o utilizador é administrador
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
    }
    next();
};

// ====================== ROTAS DO CLIENTE ======================
// Retorna todas as notificações do utilizador autenticado
router.get('/my', verifyToken, async (req, res) => {
    try {
        const result = await notificationService.findMyNotifications(req);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar notificações", error: error.message });
    }
});

// Marca uma notificação específica como lida
router.put('/:id/read', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;

        // Validação básica do ID
        if (!id || id.length !== 24) {
            return res.status(400).json({ message: "ID de notificação inválido" });
        }

        // Chama o serviço para marcar a notificação como lida
        const notification = await notificationService.markAsRead(id);

        // Se a notificação não for encontrada, retorna um erro
        if (!notification) {
            return res.status(404).json({ message: "Notificação não encontrada" });
        }

        // Retorna uma resposta de sucesso
        res.json({ 
            message: "Notificação marcada como lida com sucesso", 
            notification 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Erro ao marcar como lida", 
            error: error.message 
        });
    }
});

// ====================== ROTAS DO ADMIN ======================
// Retorna todas as notificações
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const result = await notificationService.findAll(req);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar todas as notificações", error: error.message });
    }
});

// Remove permanentemente uma notificação
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await notificationService.removeById(req.params.id);
        res.json({ message: "Notificação removida com sucesso" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao remover notificação", error: error.message });
    }
});

module.exports = router;