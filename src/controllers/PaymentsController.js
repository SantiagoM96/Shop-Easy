const CartsService = require('../services/CartsService');
const cartsService = new CartsService()
const PaymentsService = require('../services/PaymentsService')

class PaymentsController {
    constructor() {
        this.service = new PaymentsService();
    }

    async createPaymentIntent(req, res) {
        const user = req.user;
        try {
            const paymentIntent = await this.service.createPaymentIntent(user);
            return res.sendSuccess(200, paymentIntent);
        } catch (error) {
            return res.sendError(500, 'Internal server error', error.message);
        }
    }

    async confirmPaymentIntent(req, res) {
        const { paymentIntentId } = req.body;
        const user = req.user;

        try {
            const paymentIntent = await this.service.confirmPaymentIntent(paymentIntentId);

            const productosSinSuficienteStock = paymentIntent.metadata.productosSinSuficienteStock || [];

            await cartsService.finishPurchase({
                amount: paymentIntent.amount,
                user,
                productosSinSuficienteStock,
            });

            return res.sendSuccess(200, 'Pago confirmado');
        } catch (error) {
            res.sendError(500, 'Internal Server error', error.message);
        }
    }
}


module.exports = PaymentsController