// data/reservations/reservationController.js
function ReservationController(ReservationModel) {

    let controller = {
        create,
        update,
        findMyReservations,
        findAll
    };

    function findAll(req) {
        return new Promise((resolve, reject) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            const capacidade = parseInt(req.query.capacidade);
            const dataInicio = req.query.dataInicio;   // YYYY-MM-DD
            const dataFim = req.query.dataFim;         // YYYY-MM-DD

            const skip = (page - 1) * limit;

            let query = {};

            // Pesquisa por tipo do espaço
            if (search) {
                query['space.tipo'] = { $regex: search, $options: 'i' };
            }

            // Capacidade exata
            if (capacidade) {
                query['space.capacidade'] = capacidade;
            }

            // Intervalo de datas (simplificado - só pelo campo "data")
            if (dataInicio || dataFim) {
                query.data = {};
                if (dataInicio) query.data.$gte = new Date(dataInicio + "T00:00:00");
                if (dataFim)    query.data.$lte = new Date(dataFim + "T23:59:59.999Z");
            }

            ReservationModel.find(query)
                .populate('user')
                .populate('space')
                .skip(skip)
                .limit(limit)
                .sort({ data: 1, horaInicio: 1 })
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
                                }
                            });
                        })
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    // Mesma lógica para as minhas reservas
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

            if (search) query['space.tipo'] = { $regex: search, $options: 'i' };
            if (capacidade) query['space.capacidade'] = capacidade;

            if (dataInicio || dataFim) {
                query.data = {};
                if (dataInicio) query.data.$gte = new Date(dataInicio + "T00:00:00");
                if (dataFim)    query.data.$lte = new Date(dataFim + "T23:59:59.999Z");
            }

            ReservationModel.find(query)
                .populate('space')
                .skip(skip)
                .limit(limit)
                .sort({ data: 1, horaInicio: 1 })
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
                                }
                            });
                        })
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    function create(values) {
        let newReservation = ReservationModel(values);
        return newReservation.save();
    }

    function update(id, reservation) {
        return new Promise((resolve, reject) => {
            ReservationModel.findByIdAndUpdate(id, reservation)
                .then(() => resolve())
                .catch(err => reject(err));
        });
    }

    return controller;
}

module.exports = ReservationController;
