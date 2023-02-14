const mongoose = require('mongoose');

const userSubs = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  telegram: {
    type: String,
    required: true,
    unique: true,
  },
  subscribed: {
    type: Boolean,
    default: false,
  },
  subscribedAt: {
    type: Date,
    // default: false,
  },
  subscribedUntil: {
    type: Date,
    // default: false,
  },
  payId: {
    type: String,
    default: '',
  },
  payObject: {
    type: Object,
    default: {},
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('UserSub', userSubs);
