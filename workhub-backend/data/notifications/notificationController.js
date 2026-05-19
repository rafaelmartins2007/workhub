// data/notifications/notificationController.js
// Controller das notificações: criar, listar, marcar como lida, remover.
function NotificationController(NotificationModel) {

    let controller = {
        create,
        createForUser,
        findMyNotifications,
        findAll,
        markAsRead,
        removeById
    };

     // Cria uma notificação genérica com os valores fornecidos
    function create(values) {
        let newNotification = NotificationModel(values);
        return newNotification.save();
    }

    // Função para criar notificação para um utilizador (usada nas reservas)
    // Cria uma notificação para um utilizador específico sem expor a lógica de criação.
    // Trata erros internamente (não lança exceção) para não bloquear a resposta principal.
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

    // Lista as notificações do utilizador autenticado, ordenadas da mais recente para a mais antiga.
    function findMyNotifications(req) {
        return new Promise((resolve, reject) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            NotificationModel.find({ user: req.user.id }) // filtra pelo utilizador do token
                .populate('reservation') // substitui o ObjectId pelo documento da reserva
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }) // -1 = descendente → mais recentes primeiro
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

    // Lista TODAS as notificações (visão do admin) com paginação
    function findAll(req) {
        return new Promise((resolve, reject) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            NotificationModel.find({}) // sem filtro → todas as notificações
                .populate('user')      // dados do utilizador a quem pertence
                .populate('reservation') // dados da reserva associada
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

    // Marca uma notificação como lida — muda o campo lida para true e devolve o documento atualizado
    function markAsRead(id) {
        return NotificationModel.findByIdAndUpdate(id, { lida: true }, { new: true }); // new: true → devolve o doc já atualizado
    }

    // Remove permanentemente uma notificação (usado pelo admin)
    function removeById(id) {
        return NotificationModel.findByIdAndDelete(id);
    }

    return controller;
}

module.exports = NotificationController;