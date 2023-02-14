const request = require('request');
const dayjs = require('dayjs');
const Temo = require('../models/Temo.model');
const now = dayjs().subtract(6, 'h');
const UserSub = require('../models/UserSus');

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
    const data = req.body;
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
            if (err) return res.status(500).json({'error':err})
            req.body.paypalId = response.body.id;
            const temo = new Temo(req.body);
            temo.save((err, tempStored) => {
                if (err) {res.status(500).json({'error':err})}
                res.json(response.body);
                // res.json(response.body);
            })
        }
    );
};

const executePayment = (req, res) => {
    console.log(req.query.token);
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
            console.log(response.body.id)
            // res.json(response.body.id );
            const pyID = response.body.id;
            Temo.findOne({ paypalId: pyID }, (err, resultTemo) => {
                res.json(resultTemo);
                // if (err) { return res.status(500).send({ message: 'Error del servidor.', err }); }
                // UserSub.findOne({telegram: resultTemo.telegram}, (err, resultUser) => {
                //
                //     if (err) { return res.status(500).send({ message: 'Error del servidor. ela buscar', err }); }
                //
                //     if(resultUser){
                //             const newDate = dayjs(resultUser.subscribedUntil).add(30, 'day');
                //             const userObj1 = {
                //                 subscribedUntil:newDate,
                //                 payId: pyID,
                //                 payObject: response.body,
                //             }
                //         UserSub.findOneAndUpdate({telegram: resultTemo.telegram}, userObj1, (err, resultUser) => {
                //             if (err) { return res.status(500).send({ message: 'Error del servidor. al actualizar', err }); }
                //             res.json({
                //                 messaje: 'Usuario actualizado correctamente',
                //                 user: resultUser,
                //             })
                //         })
                //         res.send(resultUser)
                //     }else{
                //         console.log(resultTemo)
                //         // const userObj = {
                //         //     name: resultTemo.name,
                //         //     surname: resultTemo.surname,
                //         //     email: resultTemo.email,
                //         //     telegram: resultTemo.telegram,
                //         //     subscribed: true,
                //         //     subscribedAt: now,
                //         //     subscribedUntil: now.add(30, 'day'),
                //         //     payId: pyID,
                //         //     payObject: response.body,
                //         // }
                //         //
                //         // console.log(userObj)
                //         // const userSub = new UserSub(userObj);
                //         // userSub.save((err, result) => {
                //         //     if (err) {return res.status(500).send({ message: 'Error del servidor. al guardar', err });}
                //         //     res.json({
                //         //         messaje: 'Usuario guardado correctamente',
                //         //         user: result,
                //         //     })
                //         // })
                //
                //     }
                // })
            })
            // Temp.findOne({ paypalId: response.data.id }, (err, tempStored) => {
            //     if (err) {
            //         res.status(500).send({ message: 'Error del servidor.' });
            //     } else {
            //         if (!tempStored) {
            //             res.status(404).send({ message: 'Usuario no encontrado.' });
            //         } else {
            //             const userSub = new UserSub({
            //                 name: tempStored.name,
            //                 surname: tempStored.surname,
            //                 email: tempStored.email,
            //                 telegram: tempStored.telegram,
            //                 date: now,
            //             });
            //             userSub.save((err, result) => {
            //                 if (err) {
            //                     res.status(500).send({ message: 'Error del servidor.' });
            //                 } else {
            //                     result.subscribed = true;
            //                     result.subscribedAt = now;
            //                     result.subscribedUntil = now.add(30, 'day');
            //
            //                     res.send(result);
            //
            //                 }
            //             });
            //         }
            //     }
            // })
        }
    );
};

module.exports = {
    createPayment,
    executePayment,
};
