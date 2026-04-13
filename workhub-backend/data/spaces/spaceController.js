// data/spaces/spaceController.js
function SpaceController(SpaceModel) {

    let controller = {
        create,
        findAll,
        findById,
        update,
        removeById
    };

    function create(values) {
        let newSpace = SpaceModel(values);
        return newSpace.save();
    }

    function findAll() {
        return new Promise((resolve, reject) => {
            SpaceModel.find({})
                .then(spaces => resolve(spaces))
                .catch(err => reject(err));
        });
    }

    function findById(id) {
        return new Promise((resolve, reject) => {
            SpaceModel.findById(id)
                .then(space => resolve(space))
                .catch(err => reject(err));
        });
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