// data/reservations/reservationController.js
let mongoose = require("mongoose");

function ReservationController(ReservationModel) {

    let controller = {
        create,
        update,
        findMyReservations,
        findAll
    };

    // ====================== HELPERS ======================
    // Verifica se o novo horário entra em conflito com um horário já existente
    // Retorna true quando há sobreposição (conflito)
    function hasTimeOverlap(newStart, newEnd, existingStart, existingEnd) {
        return newStart < existingEnd && newEnd > existingStart;
    }

    // Converte "HH:MM" em minutos totais desde meia-noite.
    function timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // ====================== CREATE - com verificação de sobreposição ======================

     // Cria uma nova reserva após verificar que não existe sobreposição de horário.
    function create(values) {
        return new Promise(async (resolve, reject) => {
            try {
                const { space, data, horaInicio, duracao } = values;

                if (!space || !data || !horaInicio || !duracao) {
                    return reject(new Error("Faltam dados obrigatórios para criar a reserva"));
                }

                // Converter horário da nova reserva para minutos
                const newStartMin = timeToMinutes(horaInicio);
                const newEndMin   = newStartMin + (duracao * 60);

                // Buscar reservas ATIVAS no mesmo espaço e mesma data
                // Excluímos "Cancelada" porque uma reserva cancelada liberta o horário
                const existingReservations = await ReservationModel.find({
                    space: space,
                    data: data,
                    estado: { $in: ["Pendente", "Confirmada", "Concluida"] }
                });

                // Verificar sobreposição com cada reserva existente
                for (let res of existingReservations) {
                    const existingStartMin = timeToMinutes(res.horaInicio);
                    const existingEndMin   = existingStartMin + (res.duracao * 60);

                    if (hasTimeOverlap(newStartMin, newEndMin, existingStartMin, existingEndMin)) {
                        // Rejeitar com objeto que tem status 409 — a rota usa isto para devolver o código HTTP correto
                        return reject({
                            status: 409,
                            message: "Espaço já reservado nesse horário. Escolha outro horário ou outro espaço."
                        });
                    }
                }

                // Sem conflitos → criar e guardar a reserva
                const newReservation = new ReservationModel(values);
                const saved = await newReservation.save();
                resolve(saved);

            } catch (error) {
                reject(error);
            }
        });
    }

    // ====================== FIND ALL (Admin) - com ordenação ======================
    
     // Lista todas as reservas com paginação, filtro de datas e ordenação.
    function findAll(req) {
        return new Promise((resolve, reject) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            const capacidade = parseInt(req.query.capacidade);
            const dataInicio = req.query.dataInicio; // formato "YYYY-MM-DD"
            const dataFim = req.query.dataFim;

            const skip = (page - 1) * limit;

            let query = {}; // admin vê todas as reservas (sem filtro de user)

            if (search) query['space.tipo'] = { $regex: search, $options: 'i' };
            if (capacidade) query['space.capacidade'] = capacidade;

            // Filtro de intervalo de datas usando operadores MongoDB $gte (>=) e $lte (<=)
            if (dataInicio || dataFim) {
                query.data = {};
                if (dataInicio) query.data.$gte = new Date(dataInicio + "T00:00:00");
                if (dataFim)    query.data.$lte = new Date(dataFim + "T23:59:59.999Z");
            }

            // ====================== ORDENACAO ======================
             // Ordenação por data (por omissão: mais antigas primeiro)
            let sortOption = { data: 1, horaInicio: 1 }; // default

            const sortBy = req.query.sort || 'data';
            const order = req.query.order === 'desc' ? -1 : 1;

            if (sortBy.toLowerCase() === 'data') {
                sortOption = { data: order, horaInicio: order };
            }

            ReservationModel.find(query)
                .populate('user')  // substitui o ObjectId de user pelos dados completos do utilizador
                .populate('space') // substitui o ObjectId de space pelos dados completos do espaço
                .skip(skip)
                .limit(limit)
                .sort(sortOption)
                .then(reservations => {
                    ReservationModel.countDocuments(query)
                        .then(total => {
                            resolve({
                                reservations,
                                pagination: {
                                    total,
                                    page,
                                    limit,
                                    totalPages: Math.ceil(total / limit)
                                },
                                sort: { field: sortBy, order: order === 1 ? 'asc' : 'desc' }
                            });
                        })
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    // ====================== FIND MY RESERVATIONS - com ordenação ======================

    // Lista só as reservas do utilizador autenticado — usa req.user.id como filtro base.
    function findMyReservations(req) {
        return new Promise((resolve, reject) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            const capacidade = parseInt(req.query.capacidade);
            const dataInicio = req.query.dataInicio;
            const dataFim = req.query.dataFim;

            const skip = (page - 1) * limit;

            // Filtro base: só reservas deste utilizador
            let query = { user: req.user.id };

            // Filtro opcional por estado (ex: ?status=Pendente)
            if (req.query.status) query.estado = req.query.status;

            if (search) query['space.tipo'] = { $regex: search, $options: 'i' };
            if (capacidade) query['space.capacidade'] = capacidade;
            if (dataInicio || dataFim) {
                query.data = {};
                if (dataInicio) query.data.$gte = new Date(dataInicio + "T00:00:00");
                if (dataFim)    query.data.$lte = new Date(dataFim + "T23:59:59.999Z");
            }

            let sortOption = { data: 1, horaInicio: 1 };

            const sortBy = req.query.sort || 'data';
            const order = req.query.order === 'desc' ? -1 : 1;

            if (sortBy.toLowerCase() === 'data') {
                sortOption = { data: order, horaInicio: order };
            }

            ReservationModel.find(query)
                .populate('space') // cliente precisa de ver os detalhes do espaço
                .skip(skip)
                .limit(limit)
                .sort(sortOption)
                .then(reservations => {
                    ReservationModel.countDocuments(query)
                        .then(total => {
                            resolve({
                                reservations,
                                pagination: {
                                    total,
                                    page,
                                    limit,
                                    totalPages: Math.ceil(total / limit)
                                },
                                sort: { field: sortBy, order: order === 1 ? 'asc' : 'desc' }
                            });
                        })
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    // ====================== UPDATE ======================
    // Atualiza qualquer campo de uma reserva (usado pelo admin para confirmar, cancelar, etc.)
    function update(id, reservation) {
        return new Promise((resolve, reject) => {
            ReservationModel.findByIdAndUpdate(id, reservation, { new: true })
                .then(() => resolve())
                .catch(err => reject(err));
        });
    }

    return controller;
}

module.exports = ReservationController;