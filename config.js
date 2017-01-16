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
  api: {
    url: 'http://localhost:8000'
  },
  nodemailer: {
    transporter: {
      smtps    : 'mail%40gmail.com',
      pass     : 'pass',
      provider : 'smtp.gmail.com'
    }
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
