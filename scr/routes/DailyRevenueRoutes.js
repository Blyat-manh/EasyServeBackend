const express = require('express');
const { endDay, getAllDailyRevenue, getDailyPaidOrders } = require('../controllers/DailyRevenueController');
const router = express.Router();

router.get('/', getAllDailyRevenue);
router.post('/end-day', endDay);
router.get('/dailyPaidOrders', getDailyPaidOrders);

module.exports = router;
