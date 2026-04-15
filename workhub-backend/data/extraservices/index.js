// data/extraServices/index.js
const ExtraService = require("./extraService");
const ExtraServiceController = require("./extraServiceController");

const service = ExtraServiceController(ExtraService);

module.exports = service;