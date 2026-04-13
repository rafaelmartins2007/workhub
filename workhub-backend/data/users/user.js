// data/users/user.js
let mongoose = require("mongoose");
let scopes = require("./scopes");

let RoleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    scopes: [{
        type: String,
        enum: [
            scopes['read-all'],
            scopes['manage-spaces'],
            scopes['manage-reservations'],
            scopes['manage-users'],
            scopes['manage-services']
        ]
    }]
});

let UserSchema = new mongoose.Schema({
    nome:      { type: String, required: true },
    email:     { type: String, required: true, unique: true, lowercase: true },
    contacto:  { type: String, required: true },
    morada:    { type: String, required: true },
    nif:       { type: String, required: true, unique: true },
    atividade: { type: String },
    empresa:   { type: String },
    password:  { type: String, required: true },
    role:      { type: RoleSchema }
});

let User = mongoose.model("User", UserSchema);

module.exports = User;