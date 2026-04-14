// server/spaceRoutes.js
const express = require('express');
const router = express.Router();

const Space = require('../data/spaces/space');
const SpaceController = require('../data/spaces/spaceController');

const spaceService = SpaceController(Space);

// ====================== ROTAS PÚBLICAS (qualquer pessoa pode ver) ======================
router.get('/', async (req, res) => {
    try {
        const spaces = await spaceService.findAll();
        res.json(spaces);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar espaços", error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const space = await spaceService.findById(req.params.id);
        if (!space) return res.status(404).json({ message: "Espaço não encontrado" });
        res.json(space);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar espaço", error: error.message });
    }
});

// ====================== ROTAS PROTEGIDAS (só Admin) ======================
const verifyToken = require('./middleware/authMiddleware');

// Middleware para verificar se é admin (vamos usar mais tarde)
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
    }
    next();
};

// CRUD completo para Admin
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const newSpace = await spaceService.create(req.body);
        res.status(201).json(newSpace);
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar espaço", error: error.message });
    }
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await spaceService.update(req.params.id, req.body);
        res.json({ message: "Espaço atualizado com sucesso" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar espaço", error: error.message });
    }
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await spaceService.removeById(req.params.id);
        res.json({ message: "Espaço removido com sucesso" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao remover espaço", error: error.message });
    }
});

module.exports = router;