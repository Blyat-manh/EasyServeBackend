const express = require('express');
const router = express.Router();
const { getAllTables, createTable, updateTable, deleteTable, updateTableStatus  } = require('../controllers/tableController');

router.get('/', getAllTables);
router.post('/', createTable);
router.put('/:id', updateTable);
router.delete('/:id', deleteTable);
router.put('/status/:id', updateTableStatus);

module.exports = router;
