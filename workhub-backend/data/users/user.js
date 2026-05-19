// data/users/user.js
// Define o schema do utilizador no MongoDB via Mongoose.

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

    // Campos para recuperação de password:
    resetPasswordToken:   { type: String, default: null }, // token aleatório gerado por crypto
    resetPasswordExpires: { type: Date,   default: null }  // quando o token expira (1h após gerado)

}, { timestamps: true }); // timestamps: Mongoose adiciona createdAt e updatedAt automaticamente

// regista o modelo e liga-o à coleção "users" no MongoDB
let User = mongoose.model("User", UserSchema);

module.exports = User;