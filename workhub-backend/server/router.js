// server/router.js
const express = require('express');
const router = express.Router();

// Importar as rotas (ainda não criámos, por isso ficam comentadas por agora)
 // const authRoutes = require('./auth');
// const userRoutes = require('./userRoutes');
// const spaceRoutes = require('./spaceRoutes');
// const reservationRoutes = require('./reservationRoutes');
// const extraServiceRoutes = require('./extraServiceRoutes');

// Rotas que vamos adicionar mais tarde
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/spaces', spaceRoutes);
// router.use('/reservations', reservationRoutes);
// router.use('/extra-services', extraServiceRoutes);

// Rota de teste (para confirmar que o servidor está a funcionar)
router.get('/', (req, res) => {
    res.json({ 
        message: 'API WorkHub Spaces a funcionar!',
        version: '1.0.0'
    });
});

module.exports = router;