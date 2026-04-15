// data/extraServices/extraServiceController.js
function ExtraServiceController(ExtraServiceModel) {

    let controller = {
        create,
        findAll,
        update,
        removeById
    };

    function create(values) {
        let newService = ExtraServiceModel(values);
        return newService.save();
    }

    function findAll() {
        return new Promise((resolve, reject) => {
            ExtraServiceModel.find({})
                .then(services => resolve(services))
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