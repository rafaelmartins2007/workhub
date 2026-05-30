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


// ====================== ROTAS DE AUTENTICAÇÃO (Públicas) ======================
router.post('/auth/register',        authController.register);
router.post('/auth/login',           authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password',  authController.resetPassword);

// ====================== ROTAS DOS ESPAÇOS (Acesso público para visualização) ======================
router.use('/spaces', spaceRoutes);

// Rota de logout (requer que o cliente informe que quer sair)
router.get('/auth/logout', authController.logout);

// ====================== ROTAS DE SERVIÇOS EXTRAS (GET público) ======================
router.use('/extra-services', extraServiceRoutes);

// ====================== MIDDLEWARE DE PROTEÇÃO GLOBAL ======================
// A partir deste ponto, todas as rotas declaradas em baixo exigem um token JWT válido
router.use(verifyToken);

// ====================== ROTAS PROTEGIDAS (Sub-módulos) ======================
router.use('/users', userRoutes);
router.use('/reservations', reservationRoutes);
router.use('/extra-services', extraServiceRoutes);
router.use('/notifications', notificationRoutes);

// Rota auxiliar para testar se o token está a devolver o utilizador correto
router.get('/profile', (req, res) => {
    res.json({ message: "Perfil carregado", user: req.user });
});

router.get('/', (req, res) => {
    res.json({ message: 'API WorkHub Spaces a funcionar!' });
});

module.exports = router;