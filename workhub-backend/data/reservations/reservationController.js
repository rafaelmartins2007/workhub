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
    function hasTimeOverlap(newStart, newEnd, existingStart, existingEnd) {
        return newStart < existingEnd && newEnd > existingStart;
    }

    function timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // ====================== CREATE ======================
    function create(values) {
        return new Promise(async (resolve, reject) => {
            try {
                const { space: spaceId, data, horaInicio, duracao } = values;

                if (!spaceId || !data || !horaInicio || !duracao) {
                    return reject(new Error("Faltam dados obrigatórios para criar a reserva"));
                }

                const newStartMin = timeToMinutes(horaInicio);
                const newEndMin = newStartMin + (duracao * 60);

                const existingReservations = await ReservationModel.find({
                    space: spaceId,
                    data: data,
                    estado: { $in: ["Pendente", "Confirmada", "Concluida"] }
                });

                for (let res of existingReservations) {
                    const existingStartMin = timeToMinutes(res.horaInicio);
                    const existingEndMin = existingStartMin + (res.duracao * 60);

                    if (hasTimeOverlap(newStartMin, newEndMin, existingStartMin, existingEndMin)) {
                        return reject({
                            status: 409,
                            message: "Espaço já reservado nesse horário. Escolha outro horário ou outro espaço."
                        });
                    }
                }

                // ====================== CÁLCULO DO PREÇO TOTAL ======================
                // Carrega os modelos aqui (lazy) para garantir que já estão registados
                const Space = mongoose.model("Space");
                const ExtraService = mongoose.model("ExtraService");

                // 1. Buscar o espaço para obter o precoHora
                const space = await Space.findById(spaceId);
                if (!space) {
                    return reject(new Error("Espaço não encontrado"));
                }

                const precoEspaco = space.precoHora * duracao;

                // 2. Somar os preços dos serviços extras (se existirem)
                let precoServicos = 0;
                if (values.servicosExtras && values.servicosExtras.length > 0) {
                    const extras = await ExtraService.find({
                        _id: { $in: values.servicosExtras },
                        disponivel: true
                    });
                    precoServicos = extras.reduce((sum, s) => sum + s.preco, 0);
                }

                const precoTotal = precoEspaco + precoServicos;
                // =====================================================================

                const newReservation = new ReservationModel({ ...values, precoTotal });
                const saved = await newReservation.save();
                resolve(saved);

            } catch (error) {
                reject(error);
            }
        });
    }

    // ====================== FIND ALL (Admin) ======================
    function findAll(req) {
        return new Promise((resolve, reject) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            const capacidade = parseInt(req.query.capacidade);
            const dataInicio = req.query.dataInicio;
            const dataFim = req.query.dataFim;
            const estado = req.query.status || req.query.estado;

            const skip = (page - 1) * limit;

            let query = {};

            if (search) query['space.tipo'] = { $regex: search, $options: 'i' };
            if (capacidade) query['space.capacidade'] = capacidade;

            if (dataInicio || dataFim) {
                query.data = {};
                if (dataInicio) query.data.$gte = new Date(dataInicio + "T00:00:00");
                if (dataFim) query.data.$lte = new Date(dataFim + "T23:59:59.999Z");
            }

            if (estado) {
                query.estado = estado;
            }

            let sortOption = { data: 1, horaInicio: 1 };
            const sortBy = req.query.sort || 'data';
            const order = req.query.order === 'desc' ? -1 : 1;

            if (sortBy.toLowerCase() === 'data') {
                sortOption = { data: order, horaInicio: order };
            }

            ReservationModel.find(query)
                .populate('user')
                .populate('space')
                .populate('servicosExtras')
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

    // ====================== FIND MY RESERVATIONS ======================
    function findMyReservations(req) {
        return new Promise((resolve, reject) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            const capacidade = parseInt(req.query.capacidade);
            const dataInicio = req.query.dataInicio;
            const dataFim = req.query.dataFim;

            const skip = (page - 1) * limit;

            let query = { user: req.user.id };

            if (req.query.status) query.estado = req.query.status;

            if (search) query['space.tipo'] = { $regex: search, $options: 'i' };
            if (capacidade) query['space.capacidade'] = capacidade;

            if (dataInicio || dataFim) {
                query.data = {};
                if (dataInicio) query.data.$gte = new Date(dataInicio + "T00:00:00");
                if (dataFim) query.data.$lte = new Date(dataFim + "T23:59:59.999Z");
            }

            let sortOption = { data: 1, horaInicio: 1 };
            const sortBy = req.query.sort || 'data';
            const order = req.query.order === 'desc' ? -1 : 1;

            if (sortBy.toLowerCase() === 'data') {
                sortOption = { data: order, horaInicio: order };
            }

            ReservationModel.find(query)
                .populate('space')
                .populate('servicosExtras')
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
    function update(id, reservation) {
        return new Promise((resolve, reject) => {
            ReservationModel.findByIdAndUpdate(id, reservation, { new: true })
                .populate('user')
                .populate('space')
                .populate('servicosExtras')
                .then(updated => resolve(updated))
                .catch(err => reject(err));
        });
    }

    return controller;
}

module.exports = ReservationController;