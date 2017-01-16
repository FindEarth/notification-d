const EmailSender = require('./sender-email');

class Sender {

  constructor(config) {
    this.config = config;

    this.emailSender = new EmailSender(this.config);
  }

  send(notificationSet, cb = () => {}) {
    this.emailSender.send({
      from   : 'hi@alertasolidaria.com',
      to     : 'nicolas.delvalle@gmail.com',
      subject: notificationSet.title,
      text   : notificationSet.body
    }, cb);
  }
}

module.exports = Sender;
