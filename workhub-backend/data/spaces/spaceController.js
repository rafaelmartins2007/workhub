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
            const capacidade = parseInt(req.query.capacidade);  // pode ser NaN se não enviado

            const skip = (page - 1) * limit;  // quantos objetos tem de saltar para chegar à proxima pagina ex page 2 -> 
            //                                                 skip 10 objetos (page 1) e mostrar os proximos 10 (limit)

            // Filtro base: só espaços ativos
            let query = { ativo: true };

            if (search) {
                query.tipo = { $regex: search, $options: 'i' }; // pesquisa case-insensitive no campo tipo

            }
            if (capacidade) {
                query.capacidade = capacidade;
            }

            // ====================== ORDENACAO ======================

            // Ordenação — por omissão: preço ascendente (mais barato primeiro)
            let sortOption = { precoHora: 1 }; // default: mais barato primeiro

            const sortBy = req.query.sort || 'preco';
            const order = req.query.order === 'desc' ? -1 : 1; // 1 = asc, -1 = desc

            switch (sortBy.toLowerCase()) {
                case 'preco':
                case 'precohora':
                    sortOption = { precoHora: order };
                    break;
                case 'capacidade':
                    sortOption = { capacidade: order };
                    break;
                case 'popularidade':
                    
                    sortOption = { precoHora: order }; 
                    break;
                default:
                    sortOption = { precoHora: order };
            }

            // Executar a query com paginação e ordenação
            SpaceModel.find(query)
                .skip(skip)    
                .limit(limit)  
                .sort(sortOption)
                .then(spaces => {
                    // Contar o total de documentos (para calcular totalPages)
                    SpaceModel.countDocuments(query)
                        .then(total => {
                            resolve({
                                spaces,
                                pagination: {
                                    total,
                                    page,
                                    limit,
                                    totalPages: Math.ceil(total / limit)  // arredondar para cima
                                },
                                sort: { field: sortBy, order: order === 1 ? 'asc' : 'desc' }
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