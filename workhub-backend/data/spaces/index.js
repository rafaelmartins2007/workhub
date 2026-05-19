// data/spaces/index.js
const Space = require("./space");
const SpaceController = require("./spaceController");

const service = SpaceController(Space);

module.exports = service;