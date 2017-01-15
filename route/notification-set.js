const async  = require('async');
const Router = require('express').Router;
const router = new Router();


function sendNotificationSet(req, res, next) {
  req.logger.info(`Finding notification set ${req.body}`);
  req.model('NotificationSet').countAndFind({
    status: {
      $in: ['pending', 'failed']
    },
    scheduledAt: {
      $gte: new Date(),
      $lt:  new Date()
    }
  })
    .lean()
    .exec((err, notificationSets, notificationSetCount) => {
      if (err) { return next(err); }

      async.map(notificationSets, (notificationSet, cb) => {
        req.sendNotification(notificationSet, (err, result) => {
          if (err) { return cb(err); }

          // @TODO change status from pending to sent
          cb(null, result);
        });
      }, (err, results) => {
        // results is now an array of stats for each file

        req.logger.verbose('Sending notification set to client');
        res.sendQueried(notificationSets, notificationSetCount);
      });
    });
}

function createNotificationSet(req, res, next) {
  req.logger.info(`Creating notification set ${req.body}`);
  req.body.organization = req.params.organizationId;
  req.model('NotificationSet').create(req.body, (err, notificationSet) => {
    if (err) { return next(err); }

    req.logger.verbose('Sending notification set to client');
    res.sendCreated(notificationSet);
  });
}

function queryNotificationSets(req, res, next) {
  req.logger.info(`Querying notification set ${req.query}`);
  Object.assign(req.query, { organization: req.params.organizationId });
  req.model('NotificationSet').countAndFind(req.query)
    .skip(req.skip)
    .limit(req.limit)
    .sort(req.sort)
    .lean()
    .exec((err, notificationSets, notificationSetCount) => {
      if (err) { return next(err); }

      req.logger.verbose('Sending notification set to client');
      res.sendQueried(notificationSets, notificationSetCount);
    });
}

function findNotificationSetById(req, res, next) {
  req.logger.info(`Finding notification set with id ${req.params.id}`);
  req.model('NotificationSet').findOne({
    _id         : req.params.id,
    organization: req.params.organizationId
  })
    .lean()
    .exec((err, notificationSet) => {
      if (err) { return next(err); }
      if (!notificationSet) { return res.status(404).end(); }

      req.logger.verbose('Sending notification set to client');
      res.sendFound(notificationSet);
    });
}

function findNotificationSetBySlug(req, res, next) {
  req.logger.info(`Finding notification set with slug ${req.params.slug}`);
  req.model('NotificationSet').findOne({
    slug        : req.params.slug,
    organization: req.params.organization
  })
    .lean()
    .exec((err, notificationSet) => {
      if (err) { return next(err); }
      if (!notificationSet) { return res.status(404).end(); }

      req.logger.verbose('Sending notification set to client');
      res.sendFound(notificationSet);
    });
}

function updateNotificationSetById(req, res, next) {
  req.logger.info(`Updating notification set with id ${req.params.id}`);
  req.model('NotificationSet').update({
    _id         : req.params.id,
    organization: req.params.organization
  }, req.body, (err, results) => {
    if (err) { return next(err); }

    if (results.n < 1) {
      req.logger.verbose('Notification set not found');
      return res.status(404).end();
    }

    req.logger.verbose('Notification set updated');
    res.status(204).end();
  });
}

function removeNotificationSetById(req, res, next) {
  req.logger.info(`Removing notification set with id ${req.params.id}`);
  req.model('NotificationSet').remove({
    _id         : req.params.id,
    organization: req.params.organizationId
  }, (err, results) => {
    if (err) { return next(err); }

    if (results.nModified < 1) {
      req.logger.verbose('Notification set not found');
      return res.status(404).end();
    }

    req.logger.verbose('Notification set removed');
    res.status(204).end();
  });
}

function restoreNotificationSetById(req, res, next) {
  req.logger.info(`Restoring notification set with id ${req.params.id}`);
  req.model('NotificationSet').restore({
    _id         : req.params.id,
    organization: req.params.organizationId
  }, (err, results) => {
    if (err) { return next(err); }

    if (results.nModified < 1) {
      req.logger.verbose('Notification set not found');
      return res.status(404).end();
    }
    req.logger.verbose('Notification set restored');
    res.status(204).end();
  });
}


router.post(  '/organization/:organizationId/notification-set',                   createNotificationSet);
router.get(   '/organization/:organizationId/notification-set/send',              sendNotificationSet);
router.get(   '/organization/:organizationId/notification-set',                   queryNotificationSets);
router.get(   '/organization/:organizationId/notification-set/:id([0-9a-f]{24})', findNotificationSetById);
router.get(   '/organization/:organizationId/notification-set/:slug',             findNotificationSetBySlug);
router.put(   '/organization/:organizationId/notification-set/:id',               updateNotificationSetById);
router.delete('/organization/:organizationId/notification-set/:id',               removeNotificationSetById);
router.post(  '/organization/:organizationId/notification-set/restore/:id',       restoreNotificationSetById);


module.exports = router;
