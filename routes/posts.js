const express = require('express');
const router = express.Router();

const commentsRouter = require('./comments');
const postController = require('../controllers/post');

router.use('/:postId/comments', commentsRouter);

// GET request for post details
router.get('/:id', postController.read);

// PUT request for post update
router.put('/:id', postController.update);

// DELETE request for post delete
router.delete('/:id', postController.delete);

// POST request for new post
router.post('/', postController.create);

// GET request for all posts
router.get('/', postController.readAll);

module.exports = router;
