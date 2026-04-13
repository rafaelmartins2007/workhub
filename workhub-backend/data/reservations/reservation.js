// data/reservations/reservation.js
let mongoose = require("mongoose");

let ReservationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    space: { type: mongoose.Schema.Types.ObjectId, ref: "Space", required: true },
    data: { type: Date, required: true },
    horaInicio: { type: String, required: true },
    duracao: { type: Number, required: true }, // em horas
    estado: { 
        type: String, 
        enum: ["Pendente", "Confirmada", "Cancelada", "Concluida"], 
        default: "Pendente" 
    },
    observacoes: { type: String },
    servicosExtras: [{ type: mongoose.Schema.Types.ObjectId, ref: "ExtraService" }]
}, { timestamps: true });

let Reservation = mongoose.model("Reservation", ReservationSchema);

module.exports = Reservation;