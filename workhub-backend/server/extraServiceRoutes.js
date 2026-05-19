// server/extraServiceRoutes.js
const express = require('express');
const router = express.Router();

// Importa através do index.js (padrão das aulas)
const extraServiceService = require('../data/extraServices');

const verifyToken = require('./middleware/authMiddleware');

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
    }
    next();
};

// ====================== ROTAS PÚBLICAS ======================

/**
 * GET /api/extra-services/
 * ─────────────────────────────────────────────────────────────────────────────
 * Lista todos os serviços extras disponíveis.
 */
router.get('/', async (req, res) => {
    try {
        const result = await extraServiceService.findAll(req);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar serviços extras", error: error.message });
    }
});

// ====================== ROTAS DO ADMIN ======================

/**
 * POST /api/extra-services/
 * ─────────────────────────────────────────────────────────────────────────────
 * Cria um novo serviço extra.
 */
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const newService = await extraServiceService.create(req.body);
        res.status(201).json(newService);
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar serviço extra", error: error.message });
    }
});

/**
 * PUT /api/extra-services/:id
 * ─────────────────────────────────────────────────────────────────────────────
 * Atualiza os dados de um serviço extra (incluindo disponivel: false para desativar).
 */
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await extraServiceService.update(req.params.id, req.body);
        res.json({ message: "Serviço extra atualizado com sucesso" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar serviço extra", error: error.message });
    }
});


/**
 * DELETE /api/extra-services/:id
 * ─────────────────────────────────────────────────────────────────────────────
 * Remove permanentemente um serviço extra.
 */
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await extraServiceService.removeById(req.params.id);
        res.json({ message: "Serviço extra removido com sucesso" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao remover serviço extra", error: error.message });
    }
});

module.exports = router;