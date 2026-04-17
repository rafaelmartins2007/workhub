// server/notificationRoutes.js
const express = require('express');
const router = express.Router();

const notificationService = require('../data/notifications');
const verifyToken = require('./middleware/authMiddleware');

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
    }
    next();
};

// ====================== ROTAS DO CLIENTE ======================
router.get('/my', verifyToken, async (req, res) => {
    try {
        const result = await notificationService.findMyNotifications(req);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar notificações", error: error.message });
    }
});

router.put('/:id/read', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;

        if (!id || id.length !== 24) {
            return res.status(400).json({ message: "ID de notificação inválido" });
        }

        const notification = await notificationService.markAsRead(id);

        if (!notification) {
            return res.status(404).json({ message: "Notificação não encontrada" });
        }

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
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const result = await notificationService.findAll(req);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar todas as notificações", error: error.message });
    }
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await notificationService.removeById(req.params.id);
        res.json({ message: "Notificação removida com sucesso" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao remover notificação", error: error.message });
    }
});

module.exports = router;