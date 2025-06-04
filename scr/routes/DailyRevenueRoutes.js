const express = require('express');
const { endDay, getAllDailyRevenue, getDailyPaidOrders, getCurrentPaidOrdersTotal } = require('../controllers/DailyRevenueController');
const router = express.Router();

router.get('/', getAllDailyRevenue);
router.post('/end-day', endDay);
router.get('/dailyPaidOrders', getDailyPaidOrders);
router.get('/currentPaidOrdersTotal', getCurrentPaidOrdersTotal);

module.exports = router;
