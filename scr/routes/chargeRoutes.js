const express = require('express');
const chargeController = require('../controllers/ChargeController');
const router = express.Router();

router.post('/api/orders/chargeByTable/:table_id', chargeController.chargeOrdersByTable);

module.exports = router;
