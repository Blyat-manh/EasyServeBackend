const express = require('express');
const { getAllOrders, createOrder, updateOrder, deleteOrder, getOrdersByTable, markOrderAsPaid } = require('../controllers/orderController');
const router = express.Router();

router.get('/', getAllOrders);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);
router.get('/table/:table', getOrdersByTable);
router.post('/charge/:table', markOrderAsPaid);

module.exports = router;