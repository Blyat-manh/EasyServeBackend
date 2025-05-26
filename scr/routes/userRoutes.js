const express = require('express');
const { loginUser, recoverPassword } = require('../controllers/userController');
const router = express.Router();

router.post('/login', loginUser);
router.post('/recover-password', recoverPassword);

module.exports = router;
