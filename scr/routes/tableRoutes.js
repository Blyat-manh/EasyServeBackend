const express = require('express');
const router = express.Router();
const { getAllTables, createTable, updateTable, deleteTable } = require('../controllers/tableController');

router.get('/', getAllTables);
router.post('/', createTable);
router.put('/:id', updateTable);
router.delete('/:id', deleteTable);

module.exports = router;
