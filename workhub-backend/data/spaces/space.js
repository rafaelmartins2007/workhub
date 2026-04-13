// data/spaces/space.js
var mongoose = require('mongoose');
let Schema = mongoose.Schema;

let SpaceSchema = new Schema({
    tipo: { type: String, required: true, enum: ["secretaria_partilhada", "sala_reuniao", "gabinete_privado", "auditorio"] },
    descricao: { type: String, required: true },
    capacidade: { type: Number, required: true },
    equipamentos: { type: [String], default: [] },
    precoHora: { type: Number, required: true },
    precoDia: { type: Number },
    imagens: { type: [String], default: [] },
    ativo: { type: Boolean, default: true }
});

let Space = mongoose.model('Space', SpaceSchema);

module.exports = Space;