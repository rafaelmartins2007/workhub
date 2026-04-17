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

    // ====================== CREATE - com verificação de sobreposição ======================
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
                const existingReservations = await ReservationModel.find({
                    space: space,
                    data: data,
                    estado: { $in: ["Pendente", "Confirmada", "Concluida"] }
                });

                // Verificar sobreposição
                for (let res of existingReservations) {
                    const existingStartMin = timeToMinutes(res.horaInicio);
                    const existingEndMin   = existingStartMin + (res.duracao * 60);

                    if (hasTimeOverlap(newStartMin, newEndMin, existingStartMin, existingEndMin)) {
                        return reject({
                            status: 409,
                            message: "Espaço já reservado nesse horário. Escolha outro horário ou outro espaço."
                        });
                    }
                }

                // Sem conflitos → criar a reserva
                const newReservation = new ReservationModel(values);
                const saved = await newReservation.save();
                resolve(saved);

            } catch (error) {
                reject(error);
            }
        });
    }

    // ====================== FIND ALL (Admin) - com ordenação ======================
    function findAll(req) {
        return new Promise((resolve, reject) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            const capacidade = parseInt(req.query.capacidade);
            const dataInicio = req.query.dataInicio;
            const dataFim = req.query.dataFim;

            const skip = (page - 1) * limit;

            let query = {};

            if (search) query['space.tipo'] = { $regex: search, $options: 'i' };
            if (capacidade) query['space.capacidade'] = capacidade;
            if (dataInicio || dataFim) {
                query.data = {};
                if (dataInicio) query.data.$gte = new Date(dataInicio + "T00:00:00");
                if (dataFim)    query.data.$lte = new Date(dataFim + "T23:59:59.999Z");
            }

            // ====================== ORDENACAO ======================
            let sortOption = { data: 1, horaInicio: 1 }; // default

            const sortBy = req.query.sort || 'data';
            const order = req.query.order === 'desc' ? -1 : 1;

            if (sortBy.toLowerCase() === 'data') {
                sortOption = { data: order, horaInicio: order };
            }

            ReservationModel.find(query)
                .populate('user')
                .populate('space')
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
                if (dataFim)    query.data.$lte = new Date(dataFim + "T23:59:59.999Z");
            }

            let sortOption = { data: 1, horaInicio: 1 };

            const sortBy = req.query.sort || 'data';
            const order = req.query.order === 'desc' ? -1 : 1;

            if (sortBy.toLowerCase() === 'data') {
                sortOption = { data: order, horaInicio: order };
            }

            ReservationModel.find(query)
                .populate('space')
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
                .then(() => resolve())
                .catch(err => reject(err));
        });
    }

    return controller;
}

module.exports = ReservationController;