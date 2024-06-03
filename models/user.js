const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: { type: Boolean, default: false },
  status: {
    type: String,
    required: true,
    enum: ['guest', 'author', 'moderator'],
    default: 'guest',
  },
});

module.exports = mongoose.model('User', UserSchema);
