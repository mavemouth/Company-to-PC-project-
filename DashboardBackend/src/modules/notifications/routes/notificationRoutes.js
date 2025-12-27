const express = require('express');
const router = express.Router();

// Notifications routes
router.get('/', (req, res) => {
  res.json({ message: 'Notifications', data: [] });
});

router.post('/', (req, res) => {
  res.json({ message: 'Notification created', data: {} });
});

router.put('/:id/read', (req, res) => {
  res.json({ message: 'Notification marked as read', data: {} });
});

module.exports = router;