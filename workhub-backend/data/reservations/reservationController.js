// data/reservations/reservationController.js
function ReservationController(ReservationModel) {

    let controller = {
        create,
        update
        // findAll, findById, removeById podem ser adicionados depois se quiseres
    };

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