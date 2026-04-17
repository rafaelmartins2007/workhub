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
            const search = req.query.search || "";
            const capacidade = parseInt(req.query.capacidade);

            const skip = (page - 1) * limit;

            let query = { ativo: true };

            if (search) {
                query.tipo = { $regex: search, $options: 'i' };
            }
            if (capacidade) {
                query.capacidade = capacidade;
            }

            // ====================== ORDENACAO ======================
            let sortOption = { precoHora: 1 }; // default: mais barato primeiro

            const sortBy = req.query.sort || 'preco';
            const order = req.query.order === 'desc' ? -1 : 1;

            switch (sortBy.toLowerCase()) {
                case 'preco':
                case 'precohora':
                    sortOption = { precoHora: order };
                    break;
                case 'capacidade':
                    sortOption = { capacidade: order };
                    break;
                case 'popularidade':
                    // Placeholder (pode ser melhorado mais tarde com contagem de reservas)
                    sortOption = { precoHora: order }; // por enquanto ordena por preço
                    break;
                default:
                    sortOption = { precoHora: order };
            }

            SpaceModel.find(query)
                .skip(skip)
                .limit(limit)
                .sort(sortOption)
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
                                },
                                sort: { field: sortBy, order: order === 1 ? 'asc' : 'desc' }
                            });
                        })
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    function findById(id) {
        return new Promise((resolve, reject) => {
            SpaceModel.findOne({ _id: id, ativo: true })
                .then(space => {
                    if (!space) return reject(new Error("Espaço não encontrado ou inativo"));
                    resolve(space);
                })
                .catch(err => reject(err));
        });
    }

    function create(values) {
        let newSpace = SpaceModel(values);
        return newSpace.save();
    }

    function update(id, space) {
        return new Promise((resolve, reject) => {
            SpaceModel.findByIdAndUpdate(id, space, { new: true })
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