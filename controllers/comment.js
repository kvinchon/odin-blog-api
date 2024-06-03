const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const passport = require('passport');
const Post = require('../models/post');
const Comment = require('../models/comment');

exports.create = [
  body('content', 'Content must not be empty')
    .trim()
    .isLength({ min: 1 })
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

        const post = await Post.findOne({
          _id: req.params.postId,
          published: true,
        });
        if (!post) {
          return res.status(404).json({ error: 'Post not found' });
        }

        // Create comment
        const comment = new Comment({
          content: req.body.content,
          post: req.params.postId,
          author: user,
          created_at: new Date(),
          updated_at: new Date(),
        });

        await comment.save();
        res.sendStatus(200);
      }
    )(req, res, next);
  }),
];

exports.readAll = asyncHandler(async (req, res) => {
  const [post, comments] = await Promise.all([
    Post.findOne({ _id: req.params.postId, published: true }),
    Comment.find({ post: req.params.postId })
      .sort({ created_at: 1 })
      .populate('author'),
  ]);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  res.json({ comments });
});

exports.read = asyncHandler(async (req, res, next) => {
  const [post, comment] = await Promise.all([
    Post.findOne({ _id: req.params.postId, published: true }),
    Comment.findOne({ _id: req.params.id, post: req.params.postId }).populate(
      'author'
    ),
  ]);

  if (!comment) {
    return res.sendStatus(404);
  }

  res.json(comment);
});

exports.update = [
  body('content', 'Content must not be empty')
    .optional()
    .trim()
    .isLength({ min: 1 })
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

        const [post, comment] = await Promise.all([
          Post.findOne({ _id: req.params.postId, published: true }),
          Comment.findOne({ _id: req.params.id, post: req.params.postId }),
        ]);
        if (!post) {
          return res.status(404).json({ error: 'Post not found' });
        }
        if (!comment) {
          return res.sendStatus(404);
        }
        if (comment.author.toString() !== user.id.toString()) {
          return res.sendStatus(403);
        }

        // Update comment
        const updatedComment = new Comment({
          content: req.body.content,
          updated_at: new Date(),
          _id: req.params.id,
        });

        await Comment.findByIdAndUpdate(req.params.id, updatedComment);
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

    const [post, comment] = await Promise.all([
      Post.findOne({ _id: req.params.postId, published: true }),
      Comment.findOne({ _id: req.params.id, post: req.params.postId }),
    ]);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (!comment) {
      return res.sendStatus(404);
    }
    if (comment.author.toString() !== user.id.toString()) {
      return res.sendStatus(403);
    }

    // Delete comment
    await Comment.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  })(req, res, next);
};
