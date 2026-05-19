// data/extraServices/index.js

// Instancia o controller injetando o modelo ExtraService.
const ExtraService = require("./extraService");
const ExtraServiceController = require("./extraServiceController");

const service = ExtraServiceController(ExtraService);

module.exports = service;