const express = require('express');
const { endDay, getAllCashRecords } = require('../controllers/cashController');
const router = express.Router();

router.post('/endday', endDay);
router.get('/', getAllCashRecords);

module.exports = router;