const async  = require('async');
const Router = require('express').Router;
const router = new Router();

// const request     = require('request');
// const nodemailer  = require('nodemailer');
// const config      = require('../config');
// const transporter = nodemailer.createTransport(`smtps://${config.nodemailer.transporter.smtps}:${config.nodemailer.transporter.pass}@${config.nodemailer.transporter.provider}`);


// function configureMail(mail, body, subject) {
//   const mailOptions = {
//     from  : '"Find earth Notification" <brianelblog@gmail.com>', // sender address
//     to    : mail,
//     subject,
//     text  : body,
//     html  : body
//   };
//   return mailOptions;
// }
//
// function sendMail(mail, body, subject, req, res, next) {
//   transporter.sendMail(configureMail(mail, body, subject), (err, info) => {
//     if (err) { return next(err); }
//     req.logger.verbose('Notification succesfully sent');
//     res.status(204).end();
//   });
// }

function sendNotificationSet(req, res, next) {

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

  // sqsAm.receiveMessage({
  //   WaitTimeSeconds  : 0,
  //   VisibilityTimeout: 10
  // }, (err, data) => {
  //   if (!data.Messages) {
  //     const error = new Error( 'There is no messages');
  //     error.type = 'EmptyQueue';
  //     return next(error);
  //   }
  //   if (err) { return next(err); }
  //   const bodyParsed = JSON.parse(data.Messages[0].Body);
  //   req.logger.info( 'Sending Notification by push or SMS ');
  //   req.logger.info( `Changing status to  complete for notification with id: ${bodyParsed.notification_id}  `);
  //   req.logger.info( 'Deleting:', data.Messages[0].MessageId );
  //
  //   request({ url: `${config.api.url}/organization/5835e74705fe7a0bb575598a/notification-set/${bodyParsed.notification_id}`, method: 'PUT', json: { status: 'success' } }, () => {
  //     req.logger.info('Status cambiado a success');
  //     // TODO REFACTOR THIS - SEND TO A USER EMAIL
  //     sendMail('mail@gmail.com', bodyParsed.message, bodyParsed.title, req, res, next);
  //   });
  //   return (
  //     sqsAm.deleteMessage({ ReceiptHandle: data.Messages[0].ReceiptHandle }, (err, data) => {
  //       if (err) { return next(err); }
  //       req.logger.info('Message Deleted!');
  //     }
  //   ));
  // });
}

// function queueNotification(req) {
//   const msg = {
//     notification_id: req.body.notification_id,
//     message        : req.body.body,
//     title          : req.body.title,
//     scheduledAt    : req.body.scheduledAt,
//     geo            : req.body.geo,
//     type           : req.body.type
//   };
//   const sqsParams = {
//     MessageBody: JSON.stringify(msg),
//     QueueUrl   : config.sqs.params.QueueUrl
//   };
//   sqsAm.sendMessage(sqsParams, (err, data) => {
//     if (err) { req.logger('ERR', err); }
//   });
//   req.logger.info('La notificacion fue encolada con exito');
// }

function createNotificationSet(req, res, next) {
  req.logger.info(`Creating notification set ${req.body}`);

  req.body.organization = req.params.organizationId;
  req.model('NotificationSet').create(req.body, (err, notificationSet) => {
    if (err) { return next(err); }

    // req.logger.verbose('Enqueue notification');
    // req.body.notification_id = notificationSet._id;
    // req.body.title           = notificationSet.title;
    // req.body.scheduledAt     = notificationSet.scheduledAt;
    // req.body.geo             = notificationSet.geo;
    // req.body.type            = notificationSet.type;
    // queueNotification(req);
    req.logger.verbose('Sending notification set to client');
    res.sendCreated(notificationSet);
  });
}

function queryNotificationSets(req, res, next) {
  req.logger.info(`Querying notification set ${req.query}`);
  const query = Object.assign(req.query, { organization: req.params.organizationId });
  req.model('NotificationSet').countAndFind(query)
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
  req.logger.info(`Updating notification set with id ${req.params.id} and organization id ${req.params.organizationId}`);
  req.model('NotificationSet').update({
    _id         : req.params.id
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
