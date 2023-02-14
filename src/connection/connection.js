const mongoose = require('mongoose');
const conn = require('../config/connection.config');
mongoose.set('strictQuery', false);
const mongodb = conn.mongodb;

//mongodb://${{ MONGOUSER }}:${{ MONGOPASSWORD }}@${{ MONGOHOST }}:${{ MONGOPORT }}
const url = `mongodb://${mongodb.user}:${mongodb.password}@${mongodb.host}:${mongodb.port}`;

const connection = mongoose
  .connect(url)
  .then((db) => {
    console.log('connection DB successful');
  })
  .catch((err) => {
    console.log('error:', err);
  });

module.exports = connection;
