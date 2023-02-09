const express = require('express');
const {
  createPayment,
  executePayment,
} = require('./controllers/payment.Controller');
const app = express();

app.set('port', process.env.PORT || 5000);

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.post(`/create-payment`, createPayment);

app.get(`/execute-payment`, executePayment);

app.listen(app.get('port'), () => {
  console.log(`Server running on port ${app.get('port')}`);
});
