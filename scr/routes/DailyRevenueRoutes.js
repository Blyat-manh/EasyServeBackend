const express = require('express');
const { endDay, getAllDailyRevenue } = require('../controllers/DailyRevenueController');
const router = express.Router();

router.get('/', getAllDailyRevenue);
router.post('/end-day', endDay);

module.exports = router;
