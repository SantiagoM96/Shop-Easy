const cartModel = require('./models/cartModel')
const TicketsManager = require('./TicketsManager.mongo')
const ticketsManager = new TicketsManager()

class CartManagerMongo {
    constructor() {
        this.model = cartModel
    }

    async getCarts() {
        try {
            const carts = await this.model.find()
            return carts.map(c => c.toObject())
        } catch (error) {
            throw error
        }
    }

    async getCartById(cid) {
        try {
            const cart = await this.model.find({ _id: cid })
            return cart
        } catch (error) {
            throw error
        }
    }

    async addCart() {
        try {
            const newCart = await this.model.create({})
            return newCart
        } catch (error) {
            throw error
        }
    }

    async addProductToCart(cid, pid) {

        try {
            const cart = await this.model.findById(cid)

            const existingProductInCart = cart.products.findIndex((p) => p.product._id.toString() === pid);

            (existingProductInCart !== -1)
                ? cart.products[existingProductInCart].quantity++
                : cart.products.push({ product: pid, quantity: 1 });

            await cart.save();

        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async finishPurchase(data) {
        try {
            const newOrder = await ticketsManager.createOrder({
                amount: data.amount,
                purchaser: data.purchaser
            })
            return {
                purchaser: newOrder.purchaser,
                productosSinSuficienteStock: data.productosSinSuficienteStock,
                amount: newOrder.amount
            }
        } catch (error) {
            throw error
        }
    }

    async updateCartProducts(cid, productsIdsWithoutStock) {
        const cart = await this.model.findById(cid)
        if (!cart) throw new Error('Cart not found')
        try {
            const currentProducts = cart.products;

            const filteredProducts = currentProducts.filter((product) =>
                productsIdsWithoutStock.includes(product.product.toString())
            );

            await this.model.updateOne(
                { _id: cid },
                { $set: { products: filteredProducts } }
            );

        } catch (error) {

            throw error;
        }
    }

    async updateCartProduct(cid, pid, quantity) {
        try {
            await this.model.updateOne({ _id: cid, 'products.product': pid }, { $set: { 'products.$.quantity': quantity } });
        } catch (error) {
            throw error
        }
    }

    async deleteProductFromCart(cid, pid) {
        try {

            await this.model.updateOne(
                { _id: cid },
                { $pull: { products: { product: pid } } }
            )

        } catch (error) {
            throw error
        }
    }

    async deleteProductsFromCart(cid) {
        try {
            await this.model.updateOne(
                { _id: cid },
                { $set: { products: [] } }
            );
        } catch (error) {
            throw error
        }
    }

    async deleteCart(cid) {
        try {
            await this.getCartById(cid)
            await this.model.deleteOne({ _id: cid })
        } catch (error) {
            throw error
        }
    }
}

module.exports = CartManagerMongo