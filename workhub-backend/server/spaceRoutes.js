// server/spaceRoutes.js
const express = require('express');
const router = express.Router();

const Space = require('../data/spaces/space');
const SpaceController = require('../data/spaces/spaceController');

const spaceService = SpaceController(Space);

// ====================== ROTAS PÚBLICAS (qualquer pessoa pode ver) ======================
/**
 * GET /api/spaces/
 * ─────────────────────────────────────────────────────────────────────────────
 * Passamos req completo para o controller ter acesso a req.query.
 */
router.get('/', async (req, res) => {
    try {
        const result = await spaceService.findAll(req);   // passa o req para ter acesso às queries
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar espaços", error: error.message });
    }
});

/**
 * GET /api/spaces/:id
 * ─────────────────────────────────────────────────────────────────────────────
 * Devolve os detalhes de um espaço específico pelo seu ID MongoDB.
 * Devolve 404 se o espaço não existir ou estiver inativo.
 */
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

/**
 * POST /api/spaces/
 * ─────────────────────────────────────────────────────────────────────────────
 * Cria um novo espaço de coworking.
 */
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const newSpace = await spaceService.create(req.body);
        res.status(201).json(newSpace);
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar espaço", error: error.message });
    }
});

/**
 * PUT /api/spaces/:id
 * ─────────────────────────────────────────────────────────────────────────────
 * Atualiza os dados de um espaço existente (incluindo ativar/desativar via campo 'ativo').
 * Qualquer campo do schema Space pode ser atualizado.
 */
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await spaceService.update(req.params.id, req.body);
        res.json({ message: "Espaço atualizado com sucesso" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar espaço", error: error.message });
    }
});

/**
 * DELETE /api/spaces/:id
 * ─────────────────────────────────────────────────────────────────────────────
 * Remove permanentemente um espaço da base de dados.
 */
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await spaceService.removeById(req.params.id);
        res.json({ message: "Espaço removido com sucesso" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao remover espaço", error: error.message });
    }
});

module.exports = router;