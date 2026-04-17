// data/users/user.js
let mongoose = require("mongoose");

let UserSchema = new mongoose.Schema({
    nome:      { type: String, required: true },
    email:     { type: String, required: true, unique: true, lowercase: true },
    contacto:  { type: String, required: true },
    morada:    { type: String, required: true },
    nif:       { type: String, required: true, unique: true },
    atividade: { type: String },
    empresa:   { type: String },
    password:  { type: String, required: true },
    role:      { type: String, enum: ["client", "admin"], default: "client" },
    ativo:     { type: Boolean, default: true },

    // === CAMPOS PARA RECUPERAÇÃO DE PASSWORD ===
    resetPasswordToken:   { type: String, default: null },
    resetPasswordExpires: { type: Date,   default: null }

}, { timestamps: true });

let User = mongoose.model("User", UserSchema);

module.exports = User;