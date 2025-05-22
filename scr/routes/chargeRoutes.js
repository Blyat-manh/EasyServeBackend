const express = require('express');
const chargeController = require('../controllers/ChargeController');
const router = express.Router();

// POST /api/orders/charge/:id
router.post('/charge/:id', chargeController.chargeOrder);

module.exports = router;
