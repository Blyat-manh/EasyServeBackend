const express = require('express');
const chargeController = require('../controllers/ChargeController');
const router = express.Router();

router.post('/chargeByTable/:tableId', chargeController.chargeOrdersByTable);

module.exports = router;
