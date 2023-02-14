const mongoose = require('mongoose');

const temp = new mongoose.Schema({
  name: {
    type: String,
  },
  surname: {
    type: String,
  },
  email: {
    type: String,
  },
  telegram: {
    type: String,
    required: true,
  },
  paypalId: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('Temp', temp);
