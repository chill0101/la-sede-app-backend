const router = require('express').Router();
const authRoutes = require('./auth');
const apiRoutes = require('./api');

// Monta rutas: /auth para autenticación, / para API general
router.use('/auth', authRoutes);
router.use('/', apiRoutes);

module.exports = router;
