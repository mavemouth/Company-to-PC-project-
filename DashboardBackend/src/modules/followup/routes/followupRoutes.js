const express = require('express');
const router = express.Router();

// Followup routes
router.get('/', (req, res) => {
  res.json({ message: 'Followup data', data: [] });
});

router.post('/', (req, res) => {
  res.json({ message: 'Followup created', data: {} });
});

module.exports = router;