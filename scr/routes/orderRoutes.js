const express = require('express');
const { 
  getAllOrders, 
  createOrder, 
  updateOrder, 
  deleteOrder, 
  getOrdersByTable, 
  markOrderAsPaid, 
  getActiveOrders 
} = require('../controllers/orderController');
const router = express.Router();

router.get('/', getAllOrders);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

// CAMBIO: usa table_number (no id)
router.get('/table/:table_number', getOrdersByTable);
router.post('/charge/:id', markOrderAsPaid);
router.get('/active', getActiveOrders);

module.exports = router;