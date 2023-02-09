const request = require('request');

const CLIENT =
  'AX3_84srcfam64NkthR-XfJpcAbAxsaSl0Evgp9v1VVXqUAEj4iVKuh6mZM5I4GZl9O9YcZQL8idO_GG';
const SECRET =
  'ECvyuk20kjDYNLXOU0CftWyzNONNGxbuNOVWOCm14XlxuEmBynX-SiKw9BOkuadT1NrxT__rdYfOEHh5';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Live https://api-m.paypal.com

const auth = { user: CLIENT, pass: SECRET };

const server = process.env.PORT
  ? 'https://tradeploy-nuevo-production.up.railway.app'
  : 'http://localhost:5000';

const createPayment = (req, res) => {
  const body = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD', //https://developer.paypal.com/docs/api/reference/currency-codes/
          value: '20',
        },
      },
    ],
    application_context: {
      brand_name: `TRADEPLOY`,
      landing_page: 'NO_PREFERENCE', // Default, para mas informacion https://developer.paypal.com/docs/api/orders/v2/#definition-order_application_context
      user_action: 'PAY_NOW', // Accion para que en paypal muestre el monto del pago
      return_url: `${server}/execute-payment`, // Url despues de realizar el pago
      cancel_url: `${server}/cancel-payment`, // Url despues de realizar el pago
    },
  };
  //https://api-m.sandbox.paypal.com/v2/checkout/orders [POST]

  request.post(
    `${PAYPAL_API}/v2/checkout/orders`,
    {
      auth,
      body,
      json: true,
    },
    (err, response) => {
      res.json({ data: response.body });
    }
  );
};

const executePayment = (req, res) => {
  const token = req.query.token; //<-----------
  // res.send({ token });
  request.post(
    `${PAYPAL_API}/v2/checkout/orders/${token}/capture`,
    {
      auth,
      body: {},
      json: true,
    },
    (err, response) => {
      res.json({ data: response.body });
    }
  );
};

module.exports = {
  createPayment,
  executePayment,
};
