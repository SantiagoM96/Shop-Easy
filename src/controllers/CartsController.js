const CartsService = require('../services/CartsService')

class CartsController {
    constructor() {
        this.service = new CartsService()
    }

    async getCarts(req, res) {
        try {
            const carts = await this.service.getCarts()

            if (carts.length === 0) return res.sendError(404, 'No carts')

            return res.sendSuccess(200, carts)
        } catch (error) {
            return res.sendError(500, error);
        }
    }

    async getCartById(req, res) {
        const { cid } = req.params
        try {
            const cart = await this.service.getCartById(cid)

            if (cart.length === 0) return res.sendError(404, 'Cart not found')

            return res.sendSuccess(200, cart)
        } catch (error) {
            return res.sendError(500, error);
        }
    }

    async addCart(req, res) {
        try {
            await this.service.addCart()
            return res.sendSuccess(201, 'Successfully added')
        } catch (error) {
            return res.sendError(500, 'Error adding the cart', error);
        }
    }

    async addProductToCart(req, res) {
        const { cid, pid } = req.params
        const { userId } = req.body
        try {
            await this.service.addProductToCart(cid, pid, userId)
            return res.sendSuccess(200, 'Successfully added')
        } catch (error) {
            console.log(error);
            if (error.message === 'Product not found in inventory' || error.message === 'Cart not found') {
                return res.sendError(404, error.message);
            }
            return res.sendError(500, error.message);
        }
    }

    async finishPurchase(req, res) {
        const { cid } = req.params
        const user = req.user
        try {
            if (cid !== user.cart) return res.sendError(409, 'No corresponde al usuario el carrito');

            const order = await this.service.finishPurchase({ cid, user })

            return res.sendSuccess(200, order)
        } catch (error) {
            if (error.message === 'All products in the cart do not have enough stock.' || error.message === 'The users with the role ADMIN cannot add products to carts.' || error.message === 'You are the owner of this product') {
                return res.sendError(409, error.message)
            }
            return res.sendError(500, error.message);
        }
    }

    async updateCartProducts(req, res) {
        const { newProducts } = req.body
        const { cid } = req.params
        try {
            if (!newProducts) return res.sendError(409, 'Cannot update product list without any products')
            await this.service.updateCartProducts(cid, newProducts)
            return res.sendSuccess(200, 'Successfully updated')
        } catch (error) {

            return res.sendError(500, error);
        }
    }

    async updateCartProduct(req, res) {
        const { cid, pid } = req.params
        const { quantity } = req.body
        try {
            if (quantity === null || quantity === undefined) return res.sendError(409, 'Cannot update product without quantity')

            if (quantity < 0) return res.sendError(409, 'The quantity cannot be less than zero')

            await this.service.updateCartProduct(cid, pid, quantity)
            return res.sendSuccess(200, 'Successfully updated')
        } catch (error) {
            if (error.message === 'Product not found in inventory' ||
                error.message === 'Cart not found' ||
                error.message === 'The product you are trying to update does not exist in the cart') {
                return res.sendError(404, error)
            }
            return res.sendError(500, 'Error updating cart products', error)
        }
    }

    async deleteProductFromCart(req, res) {
        const { cid, pid } = req.params
        try {
            await this.service.deleteProductFromCart(cid, pid);
            return res.sendSuccess(200, 'Successfully deleted');
        } catch (error) {
            if (error.message === 'Product not found in inventory' || error.message === 'Cart not found' || error.message === 'The product you are trying to delete does not exist in the cart') {
                return res.sendError(404, error.message);
            }
            return res.sendError(500, error);
        }
    }

    async deleteProductsFromCart(req, res) {
        const { cid } = req.params
        try {
            await this.service.deleteProductsFromCart(cid);
            return res.sendSuccess(200, 'Successfully deleted');
        } catch (error) {
            if (error.message === 'Cart not found') return res.sendError(404, error.message);
            if (error.message === 'No products to delete') return res.sendError(409, error.message);
            return res.sendError(500, error);
        }
    }

    async deleteCart(req, res) {
        const { cid } = req.params
        try {
            await this.service.deleteCart(cid)
            return res.sendSuccess(200, 'Successfully deleted');
        } catch (error) {
            if (error.message === 'Cart not found') return res.sendError(404, error.message);
            return res.sendError(500, error.message);
        }
    }
}

module.exports = CartsController