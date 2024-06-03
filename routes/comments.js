const express = require('express');
const router = express.Router({ mergeParams: true });

const commentController = require('../controllers/comment');

// GET request for comment details
router.get('/:id', commentController.read);

// PUT request for comment update
router.put('/:id', commentController.update);

// DELETE request for comment delete
router.delete('/:id', commentController.delete);

// POST request for new comment
router.post('/', commentController.create);

// GET request for all comments
router.get('/', commentController.readAll);

module.exports = router;
