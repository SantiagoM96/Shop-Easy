const Stripe = require('stripe');
const CartsService = require('../services/CartsService');
const cartsService = new CartsService();
const ProductsService = require('../services/ProductsService')
const productsService = new ProductsService()
let stockBackup;
class PaymentsService {
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_KEY);
    }

    createPaymentIntent = async (user) => {
        try {
            const { amountTotal, filteredProductsWithStock, productosSinSuficienteStock, stockBackup } = await cartsService.processCartProducts(user.cart);

            if (!filteredProductsWithStock) {
                throw new Error('Products not found');
            }

            const amountInCents = Math.round(amountTotal * 100);

            const paymentIntentInfo = {
                amount: amountInCents,
                currency: 'usd',
                metadata: {
                    userId: user.userId,
                    description: `Payment for Cart ${user.cart}`,
                    productosSinSuficienteStock: productosSinSuficienteStock.join(','),
                    address: JSON.stringify({
                        street: 'Calle de prueba',
                        postalCode: '39941',
                        externalNumber: '123123'
                    }, null, '\t'),
                    stockBackup: JSON.stringify(stockBackup),
                }
            };

            const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentInfo);

            return paymentIntent
        } catch (error) {
            throw error
        }
    }

    async confirmPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
                payment_method: 'pm_card_visa',
                return_url: `${process.env.BASE_URL}/home`,
            });

            stockBackup = JSON.parse(paymentIntent.metadata.stockBackup);

            return paymentIntent;
        } catch (error) {

            if (error) {
                await this.restoreStock(stockBackup);
            }

            throw error;
        }
    }


    async cancelPayment(paymentIntentId) {
        try {
            const paymentIntentCancel = await this.stripe.paymentIntents.cancel(paymentIntentId)
            
            stockBackup = JSON.parse(paymentIntentCancel.metadata.stockBackup)
            await this.restoreStock(stockBackup)
            return paymentIntentCancel
        } catch (error) {
            throw error
        }
    }

    async restoreStock(productsData) {
        try {
            for (const { pid, originalStock } of productsData) {
                const stockToUpdate = { stock: originalStock }
                await productsService.updateProduct(pid, stockToUpdate);
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = PaymentsService;
