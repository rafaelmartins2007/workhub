// data/extraServices/extraServiceController.js
function ExtraServiceController(ExtraServiceModel) {

    let controller = {
        create,
        findAll,      // agora com paginação e pesquisa
        update,
        removeById
    };

    function create(values) {
        let newService = ExtraServiceModel(values);
        return newService.save();
    }

    // Listagem com paginação e pesquisa
    function findAll(req) {
        return new Promise((resolve, reject) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";

            const skip = (page - 1) * limit;

            let query = {};

            if (search) {
                query.$or = [
                    { nome: { $regex: search, $options: 'i' } },
                    { descricao: { $regex: search, $options: 'i' } }
                ];
            }

            ExtraServiceModel.find(query)
                .skip(skip)
                .limit(limit)
                .then(services => {
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

    function update(id, service) {
        return new Promise((resolve, reject) => {
            ExtraServiceModel.findByIdAndUpdate(id, service)
                .then(() => resolve())
                .catch(err => reject(err));
        });
    }

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