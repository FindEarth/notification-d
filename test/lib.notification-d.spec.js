/* eslint-disable max-len */
/* global describe it */

const assert = require('assert');
const sinon = require('sinon');
const NotificationD = require('../lib/notification-d');
const logger = require('./mock/logger');

describe('new NotificationD(config, logger) -> notificationD', () => {
  describe('#start(cb(err))', () => {
    it('starts the database and server', sinon.test((cb) => {
      const config = {
        vault: {},
        server: {
          url    : 'http://localhost:8000',
          sslCA  : '',
          sslKey : '',
          sslCert: ''
        }
      };
      const notificationD = new NotificationD(config, logger);

      sinon.stub(notificationD.database, 'connect').callsArgWith(0, null);
      sinon.stub(notificationD.server, 'listen').callsArgWith(0, null);

      notificationD.start((err, result) => {
        if (err) { return cb(err); }

        sinon.assert.calledOnce(notificationD.database.connect);
        sinon.assert.calledOnce(notificationD.server.listen);

        assert.deepEqual(result, { url: 'http://localhost:8000' });

        cb(null);
      });
    }));
  });

  describe('#stop(cb(err))', () => {
    it('stops the database and server', sinon.test((cb) => {
      const config = {
        server: { sslCA: '', sslKey: '', sslCert: '' }
      };
      const notificationD = new NotificationD(config, logger);

      notificationD.isRunning = true;

      sinon.stub(notificationD.database, 'disconnect').callsArgWith(0, null);
      sinon.stub(notificationD.server, 'close').callsArgWith(0, null);

      notificationD.stop((err) => {
        if (err) { return cb(err); }

        sinon.assert.calledOnce(notificationD.database.disconnect);
        sinon.assert.calledOnce(notificationD.server.close);

        cb(null);
      });
    }));
  });
});
