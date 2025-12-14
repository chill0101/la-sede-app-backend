const router = require('express').Router();
const authRoutes = require('./auth');
const apiRoutes = require('./api');

// Mount routes
router.use('/auth', authRoutes);


router.use('/', apiRoutes);

module.exports = router;
