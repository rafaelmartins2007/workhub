// server/reservationRoutes.js
const express = require('express');
const router = express.Router();

const Reservation = require('../data/reservations/reservation');
const ReservationController = require('../data/reservations/reservationController');
const notificationService = require('../data/notifications');   // ← necessário para a notificação

const reservationService = ReservationController(Reservation);

const verifyToken = require('./middleware/authMiddleware');

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
    }
    next();
};

// ====================== ROTAS DO CLIENTE ======================
router.post('/', verifyToken, async (req, res) => {
    try {
        if (!req.user.ativo) {
            return res.status(403).json({ message: "Conta suspensa. Não é possível fazer reservas." });
        }

        const reservationData = {
            ...req.body,
            user: req.user.id
        };

        const newReservation = await reservationService.create(reservationData);

        // === NOTIFICAÇÃO AUTOMÁTICA AO CRIAR RESERVA ===
        await notificationService.createForUser(
            req.user.id,
            "reserva_criada",
            "Reserva criada com sucesso",
            `A tua reserva para o dia ${newReservation.data.toISOString().split('T')[0]} foi registada com sucesso!`,
            newReservation._id
        );


        res.status(201).json(newReservation);
    } catch (error) {
        if (error.status === 409) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: "Erro ao criar reserva", error: error.message });
    }
});

router.get('/my', verifyToken, async (req, res) => {
    try {
        const result = await reservationService.findMyReservations(req);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar minhas reservas", error: error.message });
    }
});

// ====================== ROTAS DO ADMINISTRADOR ======================
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const result = await reservationService.findAll(req);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar todas as reservas", error: error.message });
    }
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const updated = await reservationService.update(req.params.id, req.body);
        res.json({ message: "Reserva atualizada com sucesso", reservation: updated });
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar reserva", error: error.message });
    }
});

module.exports = router;