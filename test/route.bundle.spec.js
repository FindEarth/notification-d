/* eslint-disable max-len */
/* global describe it before beforeEach after */

let request          = require('request');
const assert         = require('assert');
const assertContains = require('assert-contains');
const config         = require('../config');

const newBundle1Fixture    = require('./fixture/new-bundle-1');
const bundle1Fixture       = require('./fixture/bundle-1');
const updateBundle1Fixture = require('./fixture/update-bundle-1');

config.server.url = 'http://localhost:8050';
config.mongo.url  = 'mongodb://localhost/notificationD-test';
config.logger     = {};

const test = require('../');
const connection = test.database.mongoose.connection;

request = request.defaults({ baseUrl: 'http://localhost:8050' });

describe('Bundle Routes', () => {
  before(done => test.start(done));

  beforeEach((done) => { connection.db.collection('bundles').remove({}, done); });

  after(done => test.stop(done));


  describe('Create Bundle Route - POST /', () => {
    it('creates a bundle document in the database', (cb) => {
      request.post('bundle', { json: newBundle1Fixture }, (err, clientRes) => {
        if (err) { return cb(err); }

        connection.db.collection('bundles').find({}).toArray((err, bundles) => {
          if (err) { return cb(err); }

          assert.equal(bundles.length, 1);

          const bundle = bundles[0];
          bundle._id = bundle._id.toString();
          assertContains(bundle, newBundle1Fixture);
          cb(null);
        });
      });
    });

    it('responds with the newly created account document and a 201 status code', (cb) => {
      request.post('bundle', { json: newBundle1Fixture }, (err, clientRes) => {
        if (err) { return cb(err); }

        assert.equal(clientRes.statusCode, 201);
        assertContains(clientRes.body, newBundle1Fixture);
        cb(null);
      });
    });

    it('responds with a 400 error if the body of the request does not align with the schema', (cb) => {
      request.post('bundle', { json: { foo: 'bar' } }, (err, clientRes) => {
        if (err) { return cb(err); }

        assert.equal(clientRes.statusCode, 400);
        assert.ok(clientRes.body.match(/ValidationError/));
        cb(null);
      });
    });
  });

  describe('Query Bundle Route - GET /', () => {
    beforeEach(cb => connection.db.collection('bundles').insertOne(bundle1Fixture, cb));

    it('searches for a bundle document by title in the database', (cb) => {
      request.get('bundle', { json: true }, (err, clientRes) => {
        if (err) { return cb(err); }

        assertContains(clientRes.body, [newBundle1Fixture]);

        cb(null);
      });
    });
  });

  describe('Get Bundle Route - GET /:id', () => {
    beforeEach(cb => connection.db.collection('bundles').insertOne(bundle1Fixture, cb));

    it('retrieves a bundle document in the database', (cb) => {
      request.get(`bundle/${bundle1Fixture._id.toString()}`, { json: true }, (err, clientRes) => {
        if (err) { return cb(err); }

        assertContains(clientRes.body, newBundle1Fixture);

        cb(null);
      });
    });
  });

  describe('Update Bundle by Id Route - PUT /:id', () => {
    it('updates a document by id and responds with a 204', (cb) => {
      connection.db.collection('bundles').insertOne(bundle1Fixture, (err) => {
        if (err) { return cb(err); }

        request.put(`bundle/${bundle1Fixture._id.toString()}`, { json: updateBundle1Fixture }, (err, clientRes) => {
          if (err) { return cb(err); }

          assert.equal(clientRes.statusCode, 204);

          connection.db.collection('bundles').findOne({ _id: bundle1Fixture._id }, (err, bundle) => {
            if (err) { return cb(err); }

            assertContains(bundle, { title: 'Foo' } );

            cb(null);
          });
        });
      });
    });

    it('responds with a 404 error if a document does not exist with the given id', (cb) => {
      connection.db.collection('bundles').insertOne(bundle1Fixture, (err) => {
        if (err) { return cb(err); }

        request.put('bundle/5d9e362ece1cf00fa05efb96', { json: updateBundle1Fixture }, (err, clientRes) => {
          if (err) { return cb(err); }

          assert.equal(clientRes.statusCode, 404);
          cb(null);
        });
      });
    });
  });

  describe('Remove Bundle Route - DELETE /:id', () => {
    beforeEach(cb => connection.db.collection('bundles').insertOne(bundle1Fixture, cb));

    it('removes a bundle document from the database', (cb) => {
      request.delete(`bundle/${bundle1Fixture._id.toString()}`, (err, clientRes) => {
        if (err) { return cb(err); }

        assert.equal(clientRes.statusCode, 204);

        connection.db.collection('bundles').findOne({ _id: bundle1Fixture._id }, (err, bundle) => {
          if (err) { return cb(err); }

          assert.ok(bundle.removedAt instanceof Date);
          cb(null);
        });
      });
    });
  });

  describe('Restore Bundle Route - POST /restore/:id', () => {
    beforeEach( (cb) => {
      connection.db.collection('bundles').insertOne(
        Object.assign({}, bundle1Fixture, { removedAt: new Date() }),
        cb
      );
    });

    it('restores a bundle document in the database', (cb) => {
      request.post(`bundle/restore/${bundle1Fixture._id.toString()}`, (err, clientRes) => {
        if (err) { return cb(err); }

        assert.equal(clientRes.statusCode, 204);

        connection.db.collection('bundles').findOne({ _id: bundle1Fixture._id }, (err, bundle) => {
          if (err) { return cb(err); }

          assert.ok(!bundle.removedAt);

          cb(null);
        });
      });
    });
  });
});
