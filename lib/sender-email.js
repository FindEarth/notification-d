const nodemailer = require('nodemailer');

class EmailSender {

  constructor(config) {
    this.config = config;

    const smtp     = this.config.nodemailer.transporter.smtps;
    const pass     = this.config.nodemailer.transporter.pass;
    const provider = this.config.nodemailer.transporter.provider;

    this.transporter = nodemailer.createTransport(`smtps://${smtp}:${pass}@${provider}`);
  }

  send(options = {}, cb = () => {}) {
    this.transporter.sendMail({
      from   : options.from,
      to     : options.to,
      subject: options.subject,
      text   : options.body
      // html  : body
    }, (err, info) => {
      if (err) { return cb(err); }

      cb(null, info);
    });
  }
}

module.exports = EmailSender;
