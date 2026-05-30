// data/reservations/reservation.js
let mongoose = require("mongoose");

let ReservationSchema = new mongoose.Schema({
    // ObjectId com referência ao modelo "User" — permite usar .populate('user') para obter os dados completos
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      // Referência ao espaço reservado — permite fazer .populate('space')
    space: { type: mongoose.Schema.Types.ObjectId, ref: "Space", required: true },
    data: { type: Date, required: true },          // dia da reserva
    horaInicio: { type: String, required: true },  // formato "HH:MM", ex: "09:30"
    duracao: { type: Number, required: true },     // em horas
    estado: { 
        type: String, 
        enum: ["Pendente", "Confirmada", "Cancelada", "Concluida"], 
        default: "Pendente" 
    },
    observacoes: { type: String },
    observacoesInternas: {type: String, default: ""},    // notas internas do admin (não visíveis ao cliente)

    // Array de referências aos serviços extras selecionados
    servicosExtras: [{ type: mongoose.Schema.Types.ObjectId, ref: "ExtraService" }],

    // Preço total calculado no momento da criação da reserva:
    // (precoHora do espaço × duração em horas) + soma dos preços dos serviços extras
    precoTotal: { type: Number, default: 0 }
}, { timestamps: true });

let Reservation = mongoose.model("Reservation", ReservationSchema);

module.exports = Reservation;