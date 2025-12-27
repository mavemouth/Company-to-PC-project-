const express = require('express');
const auth = require('../../../middleware/auth');
const analyticsRoutes = require('../routes/analytics');

const router = express.Router();

// Use the analytics routes
router.use('/', analyticsRoutes);

module.exports = router;