const milieu = require('milieu');


const config = milieu('notificationd', {
  server: {
    url            : 'http://localhost:8000',
    sslCA          : '',
    sslKey         : '',
    sslCert        : '',
    maxResultsLimit: 1000
  },
  mongo: {
    url: 'mongodb://localhost/notification-d'
  },
  logger: {
    sentry: {
      dsn: ''
    },
    console: {
      level                          : 'debug',
      timestamp                      : true,
      handleExceptions               : true,
      humanReadableUnhandledException: true,
      colorize                       : true
    }
  }
});


module.exports = config;
