const express = require('express');
const router = express.Router();

const authRouter = require('./auth');
const postsRouter = require('./posts');
const usersRouter = require('./users');

router.use('/auth', authRouter);
router.use('/posts', postsRouter);
router.use('/users', usersRouter);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
