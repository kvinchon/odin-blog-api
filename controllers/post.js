const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const passport = require('passport');
const Post = require('../models/post');
const Comment = require('../models/comment');

exports.create = [
  body('title', 'Title must not be empty').trim().isLength({ min: 1 }).escape(),
  body('content', 'Content must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('published', 'Published must be a boolean')
    .optional()
    .isBoolean()
    .escape(),

  asyncHandler(async (req, res, next) => {
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

        if (user.status !== 'author') {
          return res.sendStatus(403);
        }

        // Create post
        const post = new Post({
          title: req.body.title,
          content: req.body.content,
          published: req.body.published,
          author: user,
          created_at: new Date(),
          updated_at: new Date(),
        });

        await post.save();
        res.sendStatus(200);
      }
    )(req, res, next);
  }),
];

exports.readAll = asyncHandler(async (req, res) => {
  const posts = await Post.find({ published: true }).populate('author');
  res.json({ posts });
});

exports.read = asyncHandler(async (req, res, next) => {
  const post = await Post.findOne({
    _id: req.params.id,
    published: true,
  }).populate('author');

  if (!post) {
    return res.sendStatus(404);
  }

  res.json(post);
});

exports.update = [
  body('title', 'Title must not be empty')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('content', 'Content must not be empty')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('published', 'Published must be a boolean')
    .optional()
    .isBoolean()
    .escape(),

  asyncHandler((req, res, next) => {
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

        const post = await Post.findById(req.params.id);
        if (!post) {
          return res.sendStatus(404);
        }
        if (post.author.toString() !== user.id.toString()) {
          return res.sendStatus(403);
        }

        // Update post
        const updatedPost = new Post({
          title: req.body.title,
          content: req.body.content,
          published: req.body.published,
          updated_at: new Date(),
          _id: req.params.id,
        });

        await Post.findByIdAndUpdate(req.params.id, updatedPost);
        res.sendStatus(200);
      }
    )(req, res, next);
  }),
];

exports.delete = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(404).json({ error: info.message });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.sendStatus(404);
    }
    if (post.author.toString() !== user.id.toString()) {
      return res.sendStatus(403);
    }

    // Delete post and comments
    await Promise.all([
      Comment.deleteMany({ post: req.params.id }),
      Post.findByIdAndDelete(req.params.id),
    ]);
    res.sendStatus(200);
  })(req, res, next);
};
