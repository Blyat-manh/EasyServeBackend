const express = require('express');
const { getAllEmployees, createEmployee, updateEmployee, deleteEmployee, getEmployeeById  } = require('../controllers/employeeController');
const router = express.Router();

router.get('/', getAllEmployees);
router.post('/', createEmployee);
router.put('/:name', updateEmployee);
router.delete('/:name', deleteEmployee);
router.get('/:id', getEmployeeById); 

module.exports = router;