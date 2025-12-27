const express = require('express');
const router = express.Router();

// Sync routes
router.post('/trigger', (req, res) => {
  res.json({ message: 'Sync triggered', status: 'success' });
});

router.get('/status', (req, res) => {
  res.json({ message: 'Sync status', status: 'idle' });
});

module.exports = router;