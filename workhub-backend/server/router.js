// server/router.js
const express = require('express');
const router = express.Router();

const authController = require('./auth');
const verifyToken = require('./middleware/authMiddleware');
const spaceRoutes = require('./spaceRoutes');
const reservationRoutes = require('./reservationRoutes');
const extraServiceRoutes = require('./extraServiceRoutes');

// ====================== ROTAS PÚBLICAS ======================
router.post('/auth/register', authController.register);
router.post('/auth/login',    authController.login);

// ====================== ROTAS DOS ESPAÇOS ======================
router.use('/spaces', spaceRoutes);

// ====================== ROTAS DAS RESERVAS ======================
router.use('/reservations', reservationRoutes);

// ====================== ROTAS DE SERVIÇOS EXTRAS ======================
router.use('/extra-services', extraServiceRoutes);

// ====================== ROTAS DE TESTE ======================
router.get('/profile', verifyToken, (req, res) => {
    res.json({ message: "Perfil carregado", user: req.user });
});

router.get('/', (req, res) => {
    res.json({ message: 'API WorkHub Spaces a funcionar!' });
});

module.exports = router;