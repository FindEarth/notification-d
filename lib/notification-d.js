const async    = require('async');
const Database = require('./database');
const Server   = require('./server');
const Sender   = require('./sender');

class NotificationD {

  constructor(config, logger) {
    this.config    = config;
    this.logger    = logger.child({ context: 'NotificationD' });
    this.isRunning = false;
    this.database  = new Database(config, this.logger);
    this.sender    = new Sender(config);
    this.server    = new Server(config, this.logger, this.database, this.sender);
  }

  start(cb) {
    if (this.isRunning) {
      throw new Error('Cannot start NotificationD because it is already running');
    }
    this.isRunning = true;

    this.logger.verbose('Starting NotificationD');
    async.parallel([
      cb => this.database.connect(cb),
      cb => this.server.listen(cb)
    ], (err) => {
      if (err) { return cb(err); }

      this.logger.verbose('NotificationD ready and awaiting requests');
      cb(null, { url: this.config.server.url });
    });
  }

  stop(cb) {
    if (!this.isRunning) {
      throw new Error('Cannot stop NotificationD because it is already stopped');
    }
    this.isRunning = false;

    this.logger.verbose('Stopping NotificationD');
    async.parallel([
      cb => this.database.disconnect(cb),
      cb => this.server.close(cb)
    ], (err) => {
      if (err) { return cb(err); }

      this.logger.verbose('NotificationD has closed all connections and successfully halted');
      cb(null);
    });
  }
}


module.exports = NotificationD;
