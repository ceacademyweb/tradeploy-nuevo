const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {
  createPayment,
  executePayment,
  borrrartodos,
} = require('./controllers/payment.controller2');
const connection = require('./connection/connection');
const { show } = require('./controllers/userController');
const app = express();

app.set('port', process.env.PORT || 5000);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.post(`/create-payment`, createPayment);
app.get(`/borrar`, borrrartodos);
app.get(`/user/:id`, show);

app.get(`/vincular`, (req, res) => {
  res.redirect('https://t.me/+kioMtGerOMg5OWYx');
});

app.get(`/execute-payment`, executePayment);
// app.get(`/fecha`, fecha);

app.listen(app.get('port'), () => {
  console.log(`Server running on port ${app.get('port')}`);
});
