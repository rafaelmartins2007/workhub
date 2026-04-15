// data/extraServices/extraService.js
var mongoose = require('mongoose');

let ExtraServiceSchema = new mongoose.Schema({
    nome:       { type: String, required: true },
    descricao:  { type: String, required: true },
    preco:      { type: Number, required: true },
    disponivel: { type: Boolean, default: true }
});

let ExtraService = mongoose.model('ExtraService', ExtraServiceSchema);

module.exports = ExtraService;