const config = require('./config');
const logger = require('./logger');
const NotificationD = require('./lib/notification-d');


exports = module.exports = new NotificationD(config, logger);
exports.NotificationD = NotificationD;
