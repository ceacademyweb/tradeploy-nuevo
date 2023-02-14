const mongoose = require('mongoose');

const userSubsModel = new mongoose.Schema({
    name: {
        type: String,
    },
    surname: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    telegram: {
        type: String,
    },
    subscribed: {
        type: Boolean,
    },
    subscribedAt: {
        type: Date,
    },
    subscribedUntil: {
        type: Date,
    },
    payId: {
        type: String,
    },
    payObject: {
        type: Object,
    },
    createAt: {
        type: Date,
        default: Date.now,
    }
});
module.exports = mongoose.model('Subscriptions', userSubsModel);