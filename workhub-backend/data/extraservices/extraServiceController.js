// data/extraServices/extraServiceController.js
function ExtraServiceController(ExtraServiceModel) {

    let controller = {
        create,
        findAll,      
        update,
        removeById
    };

    // POST — Cria um novo serviço extra
    function create(values) {
        let newService = ExtraServiceModel(values);
        return newService.save(); // persiste e devolve o documento criado
    }

     // GET — Lista serviços com paginação e pesquisa por nome ou descrição
    function findAll(req) {
        return new Promise((resolve, reject) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";

            const skip = (page - 1) * limit;

            let query = {};

            if (search) {
                // $or = pesquisa em AMBOS os campos (nome ou descrição)
                // $regex com $options: 'i' = case-insensitive
                query.$or = [
                    { nome: { $regex: search, $options: 'i' } },
                    { descricao: { $regex: search, $options: 'i' } }
                ];
            }

            ExtraServiceModel.find(query)
                .skip(skip)
                .limit(limit)
                .then(services => {
                    // Conta o total para calcular o número de páginas
                    ExtraServiceModel.countDocuments(query)
                        .then(total => {
                            resolve({
                                services,
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

    // PUT — Atualiza um serviço extra pelo ID
    function update(id, service) {
        return new Promise((resolve, reject) => {
            ExtraServiceModel.findByIdAndUpdate(id, service) // sem { new: true } → não precisa devolver o doc
                .then(() => resolve())
                .catch(err => reject(err));
        });
    }

    // DELETE — Remove permanentemente um serviço extra pelo ID
    function removeById(id) {
        return new Promise((resolve, reject) => {
            ExtraServiceModel.findByIdAndDelete(id)
                .then(() => resolve())
                .catch(err => reject(err));
        });
    }

    return controller;
}

module.exports = ExtraServiceController;