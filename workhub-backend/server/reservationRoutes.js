// server/reservationRoutes.js
const express = require('express');
const router = express.Router();

const Reservation = require('../data/reservations/reservation');
const ReservationController = require('../data/reservations/reservationController');
const notificationService = require('../data/notifications');

const reservationService = ReservationController(Reservation);

const verifyToken = require('./middleware/authMiddleware');

/** Middleware local: bloqueia acesso a utilizadores que não sejam admin */
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
    }
    next();
};

// ====================== ROTAS DO CLIENTE ======================
// Verificar explicitamente se a conta está ativa
router.post('/', verifyToken, async (req, res) => {
    try {
        if (!req.user.ativo) {
            return res.status(403).json({ message: "Conta suspensa. Não é possível fazer reservas." });
        }

        const reservationData = {
            ...req.body,
            user: req.user.id // ← garante que a reserva fica associada ao utilizador correto
        };


        // O controller verifica sobreposições antes de criar
        const newReservation = await reservationService.create(reservationData);

        // === NOTIFICAÇÃO AUTOMÁTICA AO CRIAR RESERVA ===
        // Após criar a reserva, vai gerar uma notificação para o cliente.
        await notificationService.createForUser(
            req.user.id,  //para quem
            "reserva_criada", //tipo
            "Reserva criada com sucesso", //titulo 
            `A tua reserva para o dia ${newReservation.data.toISOString().split('T')[0]} foi registada com sucesso!`, //mensagem
            newReservation._id //reserva associada 
        );


        res.status(201).json(newReservation);
    } catch (error) {
        // Erro de sobreposição de horário (lançado pelo controller com status 409)
        if (error.status === 409) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: "Erro ao criar reserva", error: error.message });
    }
});


/**
 * GET /api/reservations/my
 * ─────────────────────────────────────────────────────────────────────────────
 * Lista as reservas do cliente autenticado.
 */
router.get('/my', verifyToken, async (req, res) => {
    try {
        const result = await reservationService.findMyReservations(req);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar minhas reservas", error: error.message });
    }
});

// ====================== ROTAS DO ADMINISTRADOR ======================

/**
 * GET /api/reservations/
 * ─────────────────────────────────────────────────────────────────────────────
 * Lista todas as reservas de todos os utilizadores (visão global do admin).
 */
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const result = await reservationService.findAll(req);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar todas as reservas", error: error.message });
    }
});

/**
 * PUT /api/reservations/:id
 * ─────────────────────────────────────────────────────────────────────────────
 * O administrador atualiza uma reserva 
 */
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const updated = await reservationService.update(req.params.id, req.body);
        res.json({ message: "Reserva atualizada com sucesso", reservation: updated });
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar reserva", error: error.message });
    }
});

module.exports = router;