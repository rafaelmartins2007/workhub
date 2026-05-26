// data/spaces/spaceController.js
function SpaceController(SpaceModel) {

    let controller = {
        findAll,
        findById,
        create,
        update,
        removeById
    };

    // Lista espaços ativos com paginação, pesquisa por tipo e ordenação.
    function findAll(req) {
        return new Promise((resolve, reject) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";

            const skip = (page - 1) * limit;

            let query = {};

            // === LÓGICA IMPORTANTE: Admin vê tudo, cliente vê só ativos ===
            const isAdmin = req.user && req.user.role === 'admin';

            if (!isAdmin) {
                query.ativo = true;
            }

            if (search) {
                query.$or = [
                    { tipo: { $regex: search, $options: 'i' } },
                    { descricao: { $regex: search, $options: 'i' } }
                ];
            }

            SpaceModel.find(query)
                .skip(skip)
                .limit(limit)
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

    // Procura um espaço pelo id — só devolve se estiver ativo.
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


    // Cria um novo espaço — values vem diretamente do req.body
    function create(values) {
        let newSpace = SpaceModel(values); // instancia o modelo com os valores
        return newSpace.save();   // persiste na BD e devolve o documento criado
    }

    // Atualiza os campos de um espaço existente pelo _id
    function update(id, space) {
        return new Promise((resolve, reject) => {
            SpaceModel.findByIdAndUpdate(id, space, { new: true })
                .then(() => resolve())
                .catch(err => reject(err));
        });
    }

    // Remove permanentemente o espaço pelo _id
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