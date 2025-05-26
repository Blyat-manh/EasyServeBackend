const express = require('express');
const { getDiscountRates } = require('../controllers/discountController');
const router = express.Router();

router.get('/', getDiscountRates);

module.exports = router;
