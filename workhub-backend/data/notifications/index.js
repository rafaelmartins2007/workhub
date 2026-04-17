// data/notifications/index.js
const Notification = require("./notification");
const NotificationController = require("./notificationController");

const service = NotificationController(Notification);

module.exports = service;