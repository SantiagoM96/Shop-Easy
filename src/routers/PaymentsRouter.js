const PaymentsController = require('../controllers/PaymentsController');
const paymentsController = new PaymentsController()
const passportCall = require('../utils/passportCall')
const BaseRouter = require('./BaseRouter');

class PaymentsRouter extends BaseRouter {
    init() {
        this.post('/cancel-payment', paymentsController.cancelPayment.bind(paymentsController))
        this.post('/payment-intents', passportCall('jwt'), paymentsController.createPaymentIntent.bind(paymentsController))
        this.post('/confirm-payment-intent', passportCall('jwt'), paymentsController.confirmPaymentIntent.bind(paymentsController))
    }
}

module.exports = PaymentsRouter