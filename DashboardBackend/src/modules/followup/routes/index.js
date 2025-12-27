const express = require('express');
const router = express.Router();

const companiesRoutes = require('./companies.js');
const analyticsRoutes = require('./analytics.js');
const tasksRoutes = require('./tasks.js');
const calendarRoutes = require('./calendar.js');
const chatRoutes = require('./chat.js');

// Use routes
router.use('/companies', companiesRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/calendar', calendarRoutes);
router.use('/chat', chatRoutes);

module.exports = router;