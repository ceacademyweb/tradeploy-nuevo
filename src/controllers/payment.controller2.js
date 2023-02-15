const request = require('request');
const dayjs = require('dayjs');
const Temo = require('../models/Temo.model');
const now = dayjs().subtract(6, 'h');
// const userSubsModel = require('../models/userSubs.model');
const Subscriptions = require('../models/UsersSubs.model');

const CLIENT =
  'AVKimuRGPBTBkASwjuZbDHfutKxQUHqEGo_gDS9ki7NkdP2Sr1GC44ue-vboBYz0P7tL0snL0hscFuPl';
const SECRET =
  'EJ7qChCc3iMC5Q7UyFtkZEjX8LFK6SSxC1EozPRq1atzc9v7GO1ZuPHHDW4U5tfRzH9NDRqhbxWae54H';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Live https://api-m.paypal.com

const auth = { user: CLIENT, pass: SECRET };

const server = process.env.PORT
  ? 'https://tradeploy-nuevo-production.up.railway.app'
  : 'http://localhost:5000';
const front = process.env.PORT
  ? 'https://tradeploy.ceacademy.world'
  : 'http://localhost:5173';

const createPayment = (req, res) => {
  const data = req.body;
  const body = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD', //https://developer.paypal.com/docs/api/reference/currency-codes/
          value: '1',
        },
      },
    ],
    application_context: {
      brand_name: `TRADEPLOY`,
      landing_page: 'NO_PREFERENCE', // Default, para mas informacion https://developer.paypal.com/docs/api/orders/v2/#definition-order_application_context
      user_action: 'PAY_NOW', // Accion para que en paypal muestre el monto del pago
      return_url: `${server}/execute-payment`, // Url despues de realizar el pago
      cancel_url: `${front}`, // Url despues de realizar el pago
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
      if (err) return res.status(500).json({ error: err });
      req.body.paypalId = response.body.id;
      const temo = new Temo(req.body);
      temo.save((err, tempStored) => {
        if (err) {
          res.status(500).json({ error: err });
        }
        res.json(response.body);
        // res.json(response.body);
      });
    }
  );
};

const executePayment = (req, res) => {
  const token = req.query.token;
  request.post(
    `${PAYPAL_API}/v2/checkout/orders/${token}/capture`,
    {
      auth,
      body: {},
      json: true,
    },
    (err, response) => {
      const pyID = response.body.id;
      Temo.findOneAndDelete({ paypalId: pyID }, (err, resultTemo) => {
        if (err) return res.status(500).json({ error: err });

        Subscriptions.findOne(
          { telegram: resultTemo.telegram },
          (err, resultUser) => {
            if (err)
              return res
                .status(500)
                .json({ error: err, message: 'Error al buscar usuario' });
            if (resultUser) {
              const newDate = dayjs(resultUser.subscribedUntil).add(1, 'month');
              const updateSubs = {
                subscribed: true,
                subscribedUntil: newDate,
                payId: response.body.id,
                payObject: response.body,
              };
              Subscriptions.findByIdAndUpdate(
                resultUser._id,
                updateSubs,
                (err, userUpdated) => {
                  if (err) return res.status(500).json({ error: err });
                  res.redirect(
                    `${front}/suscripcion/renovacion/${resultUser._id}`
                  );
                  // res.send({message: 'Usuario Actualizado', user: userUpdated})
                }
              );
            } else {
              const newUserObj = {
                name: resultTemo.name,
                surname: resultTemo.surname,
                email: resultTemo.email,
                telegram: resultTemo.telegram,
                paypalId: resultTemo.paypalId,
                subscribed: true,
                subscribedAt: now,
                subscribedUntil: now.add(1, 'month'),
                payId: response.body.id,
                payObject: response.body,
              };
              const newUser = new Subscriptions(newUserObj);
              newUser.save((err, userStored) => {
                if (err) return res.status(500).json({ error: err });
                res.redirect(`${front}/suscripcion/nuevo/${userStored._id}`);
              });
            }
          }
        );
      });
    }
  );
};

module.exports = {
  createPayment,
  executePayment,
};
