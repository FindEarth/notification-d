/* eslint-disable max-len */
/* global describe it before beforeEach after */

let request          = require('request');
const assert         = require('assert');
const assertContains = require('assert-contains');
const config         = require('../config');

const newNotificationSet1Fixture    = require('./fixture/new-notification-set-1');
const notificationSet1Fixture       = require('./fixture/notification-set-1');
const updateNotificationSet1Fixture = require('./fixture/update-notification-set-1');

config.server.url = 'http://localhost:8050';
config.mongo.url  = 'mongodb://localhost/notificationD-test';
config.logger     = {};

const test = require('../');
const connection = test.database.mongoose.connection;

request = request.defaults({ baseUrl: 'http://localhost:8050' });

describe('NotificationSet Routes', () => {
  before(done => test.start(done));
  beforeEach((done) => { connection.db.collection('notificationsets').remove({}, done); });
  after(done => test.stop(done));

  const baseRoute = 'organization/12a3d077c143c921012e340a/notification-set';

  describe('Create NotificationSet Route - POST /', () => {
    it('creates a notificationSet document in the database', (cb) => {
      request.post(baseRoute, { json: newNotificationSet1Fixture }, (err, clientRes) => {
        if (err) { return cb(err); }

        connection.db.collection('notificationsets').find({}).toArray((err, notificationSets) => {
          if (err) { return cb(err); }
          assert.equal(notificationSets.length, 1);
          const notificationSet        = notificationSets[0];
          notificationSet.organization = notificationSet.organization.toString();
          assertContains(notificationSet, newNotificationSet1Fixture);
          cb(null);
        });
      });
    });

    it('responds with the newly created notificationSet document and a 201 status code', (cb) => {
      request.post(baseRoute, { json: newNotificationSet1Fixture }, (err, clientRes) => {
        if (err) { return cb(err); }

        clientRes.body.sentAt = new Date(clientRes.body.sentAt);

        assert.equal(clientRes.statusCode, 201);
        assertContains(clientRes.body, newNotificationSet1Fixture);
        cb(null);
      });
    });

    it('responds with a 400 error if the body of the request does not align with the schema', (cb) => {
      request.post(baseRoute, { json: { foo: 'bar' } }, (err, clientRes) => {
        if (err) { return cb(err); }

        assert.equal(clientRes.statusCode, 400);
        assert.ok(clientRes.body.match(/ValidationError/));
        cb(null);
      });
    });
  });

  describe('Get NotificationSet Route - GET /organization/:organizationId/notification-set/:id', () => {
    beforeEach((done) => { connection.db.collection('notificationsets').insertOne(notificationSet1Fixture, done); });

    it('retrieves a notificationSet document in the database', (cb) => {
      request.get(`${baseRoute}/${notificationSet1Fixture._id.toString()}`, { json: true }, (err, clientRes) => {
        if (err) { return cb(err); }
        clientRes.body.sentAt = new Date(clientRes.body.sentAt);
        assertContains(clientRes.body, newNotificationSet1Fixture);
        cb(null);
      });
    });
  });

  describe('Update notificationSet by Id Route - PUT /:id', () => {
    it.skip('updates a document by id and responds with a 204', (cb) => {
      connection.db.collection('notificationsets').insertOne(notificationSet1Fixture, (err) => {
        if (err) { return cb(err); }

        request.put(`${baseRoute}/${notificationSet1Fixture._id.toString()}`, { json: updateNotificationSet1Fixture }, (err, clientRes) => {
          if (err) { return cb(err); }

          assert.equal(clientRes.statusCode, 204);

          connection.db.collection('notificationsets').findOne({ _id: notificationSet1Fixture._id }, (err, notificationSet) => {
            if (err) { return cb(err); }

            assertContains(notificationSet, { title: 'Notification Foo updated' } );

            cb(null);
          });
        });
      });
    });

    it('responds with a 404 error if a document does not exist with the given id', (cb) => {
      connection.db.collection('notificationsets').insertOne(notificationSet1Fixture, (err) => {
        if (err) { return cb(err); }

        request.put(`${baseRoute}/5d9e362ece1cf00fa05efb96`, { json: updateNotificationSet1Fixture }, (err, clientRes) => {
          if (err) { return cb(err); }

          assert.equal(clientRes.statusCode, 404);
          cb(null);
        });
      });
    });
  });

  describe('Remove NotificationSet Route - DELETE /:id', () => {
    beforeEach((done) => { connection.db.collection('notificationsets').insertOne(notificationSet1Fixture, done); });

    it('removes a notificationSet document from the database', (cb) => {
      request.delete(`${baseRoute}/${notificationSet1Fixture._id.toString()}`, (err, clientRes) => {
        if (err) { return cb(err); }

        assert.equal(clientRes.statusCode, 204);

        connection.db.collection('notificationsets').findOne({ _id: notificationSet1Fixture._id }, (err, notificationSet) => {
          if (err) { return cb(err); }

          assert.ok(notificationSet.removedAt instanceof Date);
          cb(null);
        });
      });
    });
  });

  describe('Restore NotificationSet Route - POST /restore/:id', () => {
    beforeEach((done) => {
      connection.db.collection('notificationsets').insertOne(
        Object.assign({}, notificationSet1Fixture, { removedAt: new Date() }),
        done
      );
    });

    it('restores a notificationSet document in the database', (cb) => {
      request.post(`${baseRoute}/restore/${notificationSet1Fixture._id.toString()}`, (err, clientRes) => {
        if (err) { return cb(err); }

        assert.equal(clientRes.statusCode, 204);

        connection.db.collection('notificationsets').findOne({ _id: notificationSet1Fixture._id }, (err, notificationSet) => {
          if (err) { return cb(err); }

          assert.ok(!notificationSet.removedAt);
          cb(null);
        });
      });
    });
  });
});
