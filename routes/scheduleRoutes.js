
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// route:   POST /api/schedule-message
router.post('/schedule-message', scheduleController.scheduleMessage);

module.exports = router;