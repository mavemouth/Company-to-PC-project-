const express = require('express');
const hrRoutes = require('./modules/hr/routes/hrRoutes');
const hodRoutes = require('./modules/hod/routes/hodRoutes');
const adminRoutes = require('./modules/admin/routes/adminRoutes');
const followupRoutes = require('./modules/followup/routes');
const syncRoutes = require('./modules/sync/routes/syncRoutes');
const authRoutes = require('./modules/auth/routes/authRoutes');
const notificationRoutes = require('./modules/notifications/routes/notificationRoutes');
const calendarRoutes = require('./modules/calendar/routes/calendarRoutes');
// const analyticsRoutes = require('./modules/analytics/routes/analyticsRoutes'); // Temporarily disabled
// const auditRoutes = require('./modules/audit/routes/auditRoutes'); // Temporarily disabled

const setupRoutes = (app) => {
  // Root route
  app.get('/', (req, res) => {
    res.json({ message: 'CTPC Dashboard API is running' });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/hr', hrRoutes);
  app.use('/api/hod', hodRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/followup', followupRoutes);
  app.use('/api/sync', syncRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/calendar', calendarRoutes);
  // app.use('/api/analytics', analyticsRoutes); // Temporarily disabled
  // app.use('/api/audit', auditRoutes); // Temporarily disabled

  // Error handling for undefined routes
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
};

module.exports = { setupRoutes };
