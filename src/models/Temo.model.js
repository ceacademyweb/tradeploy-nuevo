const mongoose = require('mongoose');

const temo = new mongoose.Schema({
    name:{
        type: String,
    },
    surname:{
        type: String,
    },
    email:{
        type: String,
    },
    telegram:{
        type: String,
    },
    paypalId:{
        type: String,
    }
})

module.exports = mongoose.model('Temo', temo);