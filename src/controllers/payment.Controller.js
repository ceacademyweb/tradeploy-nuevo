const request = require('request');
const dayjs = require('dayjs');
const Temp = require('../models/Temp');
const now = dayjs().subtract(6, 'h');
const UserSub = require('../models/UserSus');
const fecha = (req, res) => {
  res.send(now);
};

const CLIENT =
  'AX3_84srcfam64NkthR-XfJpcAbAxsaSl0Evgp9v1VVXqUAEj4iVKuh6mZM5I4GZl9O9YcZQL8idO_GG';
const SECRET =
  'ECvyuk20kjDYNLXOU0CftWyzNONNGxbuNOVWOCm14XlxuEmBynX-SiKw9BOkuadT1NrxT__rdYfOEHh5';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Live https://api-m.paypal.com

const auth = { user: CLIENT, pass: SECRET };

const server = process.env.PORT
  ? 'https://tradeploy-nuevo-production.up.railway.app'
  : 'http://localhost:5000';

const front = process.env.PORT
  ? 'https://tradeploy.ceacademy.world'
  : 'http://localhost:5173';

const sendData = (req, res)=>{
    const telegram = req.body.telegram;
    const name = req.body.name;
    const surname = req.body.surname;
    const email = req.body.email;

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
          console.log(response.body.id);
          const temp = new Temp({
            telegram,
            email,
            name,
            surname,
            paypalId: response.body.id,
          });
          temp.save((error, result) => {
            if (error)
              return res.send({
                error,
                message: 'Ocurio un error vuelva a intentarlo',
              });
            res.json({data: response.body});
          });
        }
    );
}

const createPayment = (req, res) => {
  let isError = null
  console.log(req.body.telegram);
  UserSub.findOne({ telegram: req.body.telegram }, (err, result) => {
    if(result) {
      res.json({message:'Ya estas registrado'})
    }else{
      UserSub.findOne({ email: req.body.email }, (err, result) => {
        if(result) {
          res.json({message:'Ya estas registrado'})
        }else{
          sendData(req, res)
        }
      })
    }
  })
  // console.log('pasa')
  // UserSub.findOne({ email: req.body.email }, (err, user) => {
  //   if(user){
  //     let isError = true
  //      // res.json({message:'Ya estas registrado'})
  //   }
  // });
 // if(!isError) {
 //   const telegram = req.body.telegram;
 //   const name = req.body.name;
 //   const surname = req.body.surname;
 //   const email = req.body.email;
 //
 //   const body = {
 //     intent: 'CAPTURE',
 //     purchase_units: [
 //       {
 //         amount: {
 //           currency_code: 'USD', //https://developer.paypal.com/docs/api/reference/currency-codes/
 //           value: '20',
 //         },
 //       },
 //     ],
 //     application_context: {
 //       brand_name: `TRADEPLOY`,
 //       landing_page: 'NO_PREFERENCE', // Default, para mas informacion https://developer.paypal.com/docs/api/orders/v2/#definition-order_application_context
 //       user_action: 'PAY_NOW', // Accion para que en paypal muestre el monto del pago
 //       return_url: `${server}/execute-payment`, // Url despues de realizar el pago
 //       cancel_url: `${server}/cancel-payment`, // Url despues de realizar el pago
 //     },
 //   };
 //   //https://api-m.sandbox.paypal.com/v2/checkout/orders [POST]
 //
 //   request.post(
 //       `${PAYPAL_API}/v2/checkout/orders`,
 //       {
 //         auth,
 //         body,
 //         json: true,
 //       },
 //       (err, response) => {
 //         console.log(response.body.id);
 //         const temp = new Temp({
 //           telegram,
 //           email,
 //           name,
 //           surname,
 //           paypalId: response.body.id,
 //         });
 //         temp.save((error, result) => {
 //           if (error)
 //             return res.send({
 //               error,
 //               message: 'Ocurio un error vuelva a intentarlo',
 //             });
 //           res.json({data: response.body});
 //         });
 //       }
 //   );
 // }
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
      console.log(response.body.id);
      const data = {
        data: response.body,
        start: now,
        end: now.add(1, 'month'),
      }
      // res.send({data})
      const dataRes = response.body;
      console.log(dataRes.id + ' ' + dataRes.status)
      // res.send(dataRes.id)
      Temp.findOne({paypalId:dataRes.id}, (error, result) => {
        if(error) return res.send({error, message: 'Ocurio un error vuelva a intentarlo'})
        console.log(result)
        const dataSave = {
          name: result.name,
          surname: result.surname,
          email: result.email,
          telegram: result.telegram,
          subscribed: true,
          subscribedAt: now,
          subscribedUntil: now.add(1, 'month'),
          payId: dataRes.id,
          payObject: dataRes,
        }
        const userSub = new UserSub(dataSave)
        userSub.save((error,result)=>{
         if (error) {
           console.log(error)
           return res.redirect(`${front}/error/`)
         }
          console.log(result)
          // res.send(result)
          Temp.findOneAndDelete({paypalId:dataRes.id}, (error, result) => {
            if(error) return res.send({error, message: 'Ocurio un error vuelva a intentarlosgsgdsf'})
            res.redirect(`${front}/usuario/${result._id}`)

          })
        })
      })
    }
  );
};

const saveUser = (req, res) => {
  res.send(req.body);
}

module.exports = {
  createPayment,
  executePayment,
  fecha,
  saveUser
};
