const Router = require('express').Router;
const router = new Router();


function createBundle(req, res, next) {
  req.logger.info('Creating bundle', req.body);

  req.model('Bundle').create(req.body, (err, bundle) => {
    if (err) { return next(err); }

    req.logger.verbose('Sending bundle to client');
    res.sendCreated(bundle);
  });
}

function queryBundles(req, res, next) {
  req.logger.info('Querying bundles', req.query);
  req.model('Bundle').countAndFind(req.query)
    .skip(req.skip)
    .limit(req.limit)
    .sort(req.sort)
    .lean()
    .exec((err, bundles, bundleCount) => {
      if (err) { return next(err); }

      req.logger.verbose('Sending bundle to client');
      res.sendQueried(bundles, bundleCount);
    });
}

function findBundleById(req, res, next) {
  req.logger.info('Finding bundle with id %s', req.params.id);
  req.model('Bundle').findById(req.params.id)
    .lean()
    .exec((err, bundle) => {
      if (err) { return next(err); }
      if (!bundle) { return res.status(404).end(); }

      req.logger.verbose('Sending bundle to client');
      res.sendFound(bundle);
    });
}

function findBundleBySlug(req, res, next) {
  req.logger.info('Finding bundle with slug %s', req.params.slug);
  req.model('Bundle').findBySlug(req.params.slug)
    .lean()
    .exec((err, bundle) => {
      if (err) { return next(err); }
      if (!bundle) { return res.status(404).end(); }

      req.logger.verbose('Sending bundle to client');
      res.sendFound(bundle);
    });
}

function updateBundleById(req, res, next) {
  req.logger.info('Updating bundle with id %s', req.params.id);
  req.model('Bundle').update({
    _id: req.params.id
  }, req.body, (err, results) => {
    if (err) { return next(err); }

    if (results.n < 1) {
      req.logger.verbose('Bundle not found');
      return res.status(404).end();
    }
    req.logger.verbose('Bundle updated');
    res.status(204).end();
  });
}

function removeBundleById(req, res, next) {
  req.logger.info('Removing bundle with id %s', req.params.id);
  req.model('Bundle').remove({
    _id: req.params.id
  }, (err, results) => {
    if (err) { return next(err); }

    if (results.nModified < 1) {
      req.logger.verbose('Bundle not found');
      return res.status(404).end();
    }
    req.logger.verbose('Bundle removed');
    res.status(204).end();
  });
}

function restoreBundleById(req, res, next) {
  req.logger.info('Restoring bundle with id %s', req.params.id);
  req.model('Bundle').restore({
    _id: req.params.id
  }, (err, results) => {
    if (err) { return next(err); }

    if (results.nModified < 1) {
      req.logger.verbose('Bundle not found');
      return res.status(404).end();
    }
    req.logger.verbose('Bundle restored');
    res.status(204).end();
  });
}

router.post(  '/',                  createBundle);
router.get(   '/',                  queryBundles);
router.get(   '/:id([0-9a-f]{24})', findBundleById);
router.get(   '/:slug',             findBundleBySlug);
router.put(   '/:id',               updateBundleById);
router.delete('/:id',               removeBundleById);
router.post(  '/restore/:id',       restoreBundleById);


module.exports = router;
