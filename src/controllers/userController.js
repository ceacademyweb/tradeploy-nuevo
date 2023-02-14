const Subscriptions = require('../models/UsersSubs.model');

const index = (req, res) => {
  Subscriptions.find({}, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      res.json(user);
    }
  });
};

const show = (req, res) => {
  const id = req.params.id
  // res.send(id)
  Subscriptions.find({_id:id}, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      res.json(user);
    }
  });
};


module.exports = {
  index,
  show
};
