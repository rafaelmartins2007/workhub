// data/spaces/spaceController.js
function SpaceController(SpaceModel) {

    let controller = {
        findAll,
        findById,
        create,
        update,
        removeById
    };

    function findAll(req) {
        return new Promise((resolve, reject) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";           // pesquisa no tipo
            const capacidade = parseInt(req.query.capacidade);
            const data = req.query.data;                     // formato YYYY-MM-DD

            const skip = (page - 1) * limit;

            let query = { ativo: true };

            // 1. Pesquisa apenas no campo "tipo"
            if (search) {
                query.tipo = { $regex: search, $options: 'i' };
            }

            // 2. Capacidade tem de ser exatamente igual
            if (capacidade) {
                query.capacidade = capacidade;
            }

            SpaceModel.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ precoHora: 1 })
                .then(spaces => {
                    SpaceModel.countDocuments(query)
                        .then(total => {
                            resolve({
                                spaces,
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

    // Outras funções mantidas (não mudam)
    function findById(id) {
        return new Promise((resolve, reject) => {
            SpaceModel.findById(id)
                .then(space => resolve(space))
                .catch(err => reject(err));
        });
    }

    function create(values) {
        let newSpace = SpaceModel(values);
        return newSpace.save();
    }

    function update(id, space) {
        return new Promise((resolve, reject) => {
            SpaceModel.findByIdAndUpdate(id, space)
                .then(() => resolve())
                .catch(err => reject(err));
        });
    }

    function removeById(id) {
        return new Promise((resolve, reject) => {
            SpaceModel.findByIdAndDelete(id)
                .then(() => resolve())
                .catch(err => reject(err));
        });
    }

    return controller;
}

module.exports = SpaceController;