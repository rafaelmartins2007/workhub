// server/router.js
const express = require('express');
const router = express.Router();
const authController = require('./auth');
const verifyToken = require('./middleware/authMiddleware');
const spaceRoutes = require('./spaceRoutes');
const reservationRoutes = require('./reservationRoutes');
const extraServiceRoutes = require('./extraServiceRoutes');
const userRoutes = require('./userRoutes');
const notificationRoutes = require('./notificationRoutes');


// ====================== ROTAS PÚBLICAS ======================
router.post('/auth/register',        authController.register);
router.post('/auth/login',           authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password',  authController.resetPassword);

// ====================== ROTAS DOS ESPAÇOS (públicas) ======================
router.use('/spaces', spaceRoutes);

// ====================== ROTAS PROTEGIDAS (requerem login) ======================
router.get('/auth/logout', authController.logout);

// ====================== ROTAS DE SERVIÇOS EXTRAS (GET público) ======================
router.use('/extra-services', extraServiceRoutes);

// ====================== ROTAS PROTEGIDAS ======================
router.use(verifyToken);

// ====================== ROTAS DE UTILIZADORES ======================
router.use('/users', userRoutes);

// ====================== ROTAS DAS RESERVAS ======================
router.use('/reservations', reservationRoutes);

// ====================== ROTAS DE SERVIÇOS EXTRAS ======================
router.use('/extra-services', extraServiceRoutes);

// ====================== ROTAS DE NOTIFICAÇÕES ======================
router.use('/notifications', notificationRoutes);

// ====================== ROTA DE PERFIL (teste) ======================
router.get('/profile', (req, res) => {
    res.json({ message: "Perfil carregado", user: req.user });
});

router.get('/', (req, res) => {
    res.json({ message: 'API WorkHub Spaces a funcionar!' });
});

module.exports = router;