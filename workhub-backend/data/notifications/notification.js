// data/notifications/notification.js
let mongoose = require("mongoose");

let NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
    tipo: { type: String, enum: ["reserva_criada", "reserva_confirmada", "reserva_cancelada", "reserva_concluida", "outro"], required: true },
    titulo: { type: String, required: true },
    mensagem: { type: String, required: true },
    lida: { type: Boolean, default: false }
}, { timestamps: true });

let Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;