const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Comment = require('../models/comment');
const Post = require('../models/post');

exports.readAll = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.json({ users });
});

exports.read = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.sendStatus(404);
  }

  res.json(user);
});

exports.update = [
  body('username', 'Username must not be empty')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('password', 'Password must not be empty')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('status', 'Status must be equal to guest, author or moderator')
    .optional()
    .isIn(['guest', 'author', 'moderator'])
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    passport.authenticate(
      'jwt',
      { session: false },
      async (err, user, info) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(404).json({ error: info.message });
        }

        const userRecord = await User.findById(req.params.id);
        if (!userRecord) {
          return res.sendStatus(404);
        }
        if (userRecord.id.toString() !== user.id.toString()) {
          return res.sendStatus(403);
        }

        const updatedUser = new User({
          ...userRecord,
          username: req.body.username,
          status: req.body.status,
          _id: req.params.id,
        });

        if (req.body.password) {
          updatedUser.password = await bcrypt.hash(req.body.password, 10);
        }

        await User.findByIdAndUpdate(req.params.id, updatedUser);
        res.sendStatus(200);
      }
    )(req, res, next);
  },
];

exports.delete = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(404).json({ error: info.message });
    }

    const userRecord = await User.findById(req.params.id);
    if (!userRecord) {
      return res.sendStatus(404);
    }
    if (userRecord.id.toString() !== user.id.toString()) {
      return res.sendStatus(403);
    }

    // Delete user, posts and comments
    await Promise.all([
      Comment.deleteMany({ author: req.params.id }),
      Post.deleteMany({ author: req.params.id }),
      User.findByIdAndDelete(req.params.id),
    ]);
    res.sendStatus(200);
  })(req, res, next);
};
