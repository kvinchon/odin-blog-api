const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/user');

exports.signup = [
  body('username')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Username should not be empty')
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error('Username already used');
      }
    }),
  body('password', 'Password should not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('status', 'Status must be equal to guest, author or moderator')
    .isIn(['guest', 'author', 'moderator'])
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      } else {
        // Create user
        const user = new User({
          username: req.body.username,
          password: hashedPassword,
          status: req.body.status,
        });
        await user.save();
        res.sendStatus(200);
      }
    });
  },
];

exports.login = [
  body('username', 'Username should not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('password', 'Password should not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(400).json({ error: info.message });
      }

      // Generate web token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: 60 * 60,
      });
      res.status(200).json({ token });
    })(req, res, next);
  },
];

exports.logout = [];
