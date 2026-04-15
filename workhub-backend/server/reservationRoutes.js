// server/reservationRoutes.js
const express = require('express');
const router = express.Router();

const Reservation = require('../data/reservations/reservation');
const ReservationController = require('../data/reservations/reservationController');

const reservationService = ReservationController(Reservation);

const verifyToken = require('./middleware/authMiddleware');

// ====================== ROTAS DO CLIENTE ======================
router.post('/', verifyToken, async (req, res) => {
    try {
        const reservationData = {
            ...req.body,
            user: req.user.id   // associa automaticamente ao utilizador logado
        };
        const newReservation = await reservationService.create(reservationData);
        res.status(201).json(newReservation);
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar reserva", error: error.message });
    }
});

router.get('/my', verifyToken, async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user.id })
            .populate('space')
            .populate('servicosExtras');
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar minhas reservas", error: error.message });
    }
});

// ====================== ROTAS DO ADMINISTRADOR ======================
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
    }
    next();
};

router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const reservations = await Reservation.find({})
            .populate('user')
            .populate('space');
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar todas as reservas", error: error.message });
    }
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await reservationService.update(req.params.id, req.body);
        res.json({ message: "Reserva atualizada com sucesso" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar reserva", error: error.message });
    }
});

module.exports = router;