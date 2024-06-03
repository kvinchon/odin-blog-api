const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

// GET request for user details
router.get('/:id', userController.read);

// PUT request for user update
router.put('/:id', userController.update);

// DELETE request for user delete
router.delete('/:id', userController.delete);

// GET request for all users
router.get('/', userController.readAll);

module.exports = router;
