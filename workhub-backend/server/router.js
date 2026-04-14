// server/router.js
const express = require('express');
const router = express.Router();

const authController = require('./auth');
const verifyToken = require('./middleware/authMiddleware');
const spaceRoutes = require('./spaceRoutes');     // ← NOVA LINHA

// ====================== ROTAS PÚBLICAS ======================
router.post('/auth/register', authController.register);
router.post('/auth/login',    authController.login);

// ====================== ROTAS DOS ESPAÇOS ======================
router.use('/spaces', spaceRoutes);

// ====================== OUTRAS ROTAS PROTEGIDAS ======================
router.get('/profile', verifyToken, (req, res) => {
    res.json({ message: "Perfil carregado", user: req.user });
});

router.get('/', (req, res) => {
    res.json({ message: '✅ API WorkHub Spaces a funcionar!' });
});

module.exports = router;