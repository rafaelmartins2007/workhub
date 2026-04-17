// data/notifications/notificationController.js
function NotificationController(NotificationModel) {

    let controller = {
        create,
        createForUser,
        findMyNotifications,
        findAll,
        markAsRead,
        removeById
    };

    function create(values) {
        let newNotification = NotificationModel(values);
        return newNotification.save();
    }

    // Função para criar notificação para um utilizador (usada nas reservas)
    async function createForUser(userId, tipo, titulo, mensagem, reservationId = null) {
        try {
            const notification = await create({
                user: userId,
                reservation: reservationId,
                tipo: tipo,
                titulo: titulo,
                mensagem: mensagem
            });
            return notification;
        } catch (error) {
            console.error("Erro ao criar notificação:", error.message);
            return null;
        }
    }

    function findMyNotifications(req) {
        return new Promise((resolve, reject) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            NotificationModel.find({ user: req.user.id })
                .populate('reservation')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .then(notifications => {
                    NotificationModel.countDocuments({ user: req.user.id })
                        .then(total => {
                            resolve({
                                notifications,
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

    function findAll(req) {
        return new Promise((resolve, reject) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            NotificationModel.find({})
                .populate('user')
                .populate('reservation')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .then(notifications => {
                    NotificationModel.countDocuments({})
                        .then(total => {
                            resolve({
                                notifications,
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

    function markAsRead(id) {
        return NotificationModel.findByIdAndUpdate(id, { lida: true }, { new: true });
    }

    function removeById(id) {
        return NotificationModel.findByIdAndDelete(id);
    }

    return controller;
}

module.exports = NotificationController;