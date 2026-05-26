// data/spaces/spaceController.js
function SpaceController(SpaceModel) {

    let controller = {
        findAll,
        findById,
        create,
        update,
        removeById
    };

    // Lista espaços com paginação, pesquisa, filtros e ordenação.
    function findAll(req) {
        return new Promise((resolve, reject) => {
            const page       = parseInt(req.query.page)  || 1;
            const limit      = parseInt(req.query.limit) || 10;
            const search     = req.query.search     || "";
            const tipo       = req.query.tipo       || "";
            const capacidade = req.query.capacidade || "";
            const sortBy     = req.query.sortBy     || "";   // precoHora | capacidade | createdAt
            const order      = req.query.order      || "asc"; // asc | desc

            const skip = (page - 1) * limit;

            let query = {};

            // Admin vê tudo, cliente vê só ativos
            const isAdmin = req.user && req.user.role === 'admin';
            if (!isAdmin) {
                query.ativo = true;
            }

            // Pesquisa por tipo ou descrição
            if (search) {
                query.$or = [
                    { tipo:     { $regex: search, $options: 'i' } },
                    { descricao:{ $regex: search, $options: 'i' } }
                ];
            }

            // Filtro por tipo exacto
            if (tipo) {
                query.tipo = tipo;
            }

            // Filtro por capacidade mínima
            if (capacidade) {
                query.capacidade = { $gte: parseInt(capacidade) };
            }

            // Ordenação — campos permitidos: precoHora, capacidade, createdAt
            const sortFields = ["precoHora", "capacidade", "createdAt"];
            const sortField  = sortFields.includes(sortBy) ? sortBy : null;
            const sortOrder  = order === "desc" ? -1 : 1;
            const sortObj    = sortField ? { [sortField]: sortOrder } : {};

            SpaceModel.find(query)
                .sort(sortObj)
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

    // Procura um espaço pelo id
    function findById(id) {
        return new Promise((resolve, reject) => {
            SpaceModel.findById(id)
                .then(space => {
                    if (!space) return reject(new Error("Espaço não encontrado"));
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