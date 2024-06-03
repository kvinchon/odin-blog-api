const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

// POST request for signup
router.post('/signup', authController.signup);

// POST request for login
router.post('/login', authController.login);

// POST request for logout
router.post('/logout', authController.logout);

module.exports = router;
