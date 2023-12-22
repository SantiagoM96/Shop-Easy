const CartsRepository = require('../repositories/CartsRepository')
const ProductsRepository = require('../repositories/ProductsRepository')
const productsRepository = new ProductsRepository()
const { transportGmail } = require('../config/nodemailer.config')

class CartsService {
    constructor() {
        this.repository = new CartsRepository();
    }

    async getCarts() {
        try {
            return this.repository.getCarts();
        } catch (error) {
            throw error
        }
    }

    async getCartById(id) {
        try {
            return this.repository.getCartById(id)
        } catch (error) {
            throw error
        }
    }

    async addCart() {
        try {
            return this.repository.addCart()
        } catch (error) {
            throw error
        }
    }

    async addProductToCart(cid, pid, userId) {
        try {
            const cart = await this.repository.getCartById(cid)

            if (cart.length === 0) throw new Error('Cart not found')

            const product = await productsRepository.getProductById(pid)

            if (!product) throw new Error('Product not found in inventory')

            if (userId === product.owner) throw new Error('You are the owner of this product');

            if (!userId || userId === process.env.ADMIN_ID) throw new Error('The users with the role ADMIN cannot add products to carts.');

            return this.repository.addProductToCart(cid, pid)
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async processCartProducts(data) {
        let amountTotal = 0
        let productosSinSuficienteStock = []
        let stockBackup = []

        try {
            const cart = await this.repository.getCartById(data)
            if (cart.length === 0) throw new Error('Cart not found')
            const productsToPurchase = cart[0].products

            for (const productData of productsToPurchase) {
                const product = await productsRepository.getProductById(productData.product)
                if (!product) throw new Error(`Product not found: ${productData.product.title}`)

                if (product.stock >= productData.quantity) {
                    stockBackup.push({ pid: product._id, originalStock: product.stock });
                    const productTotal = product.price * productData.quantity
                    amountTotal += productTotal
                    product.stock -= productData.quantity
                    await productsRepository.updateProduct(product._id, { stock: product.stock })
                } else {
                    productosSinSuficienteStock.push(product._id);
                }
            }

            if (productosSinSuficienteStock.length === cart[0].products.length) {
                throw new Error('All products in the cart do not have enough stock.');
            }
            const filteredProductsWithStock = cart[0].products.filter((productData) => {
                return !productosSinSuficienteStock.some(id => id.equals(productData.product._id));
            });

            return { filteredProductsWithStock, amountTotal, productosSinSuficienteStock, stockBackup };
        } catch (error) {
            throw error;
        }
    }

    async finishPurchase(data) {
        const user = data.user;
        const totalAmount = data.amount
        let productosSinSuficienteStock = data.productosSinSuficienteStock
        let productsIdsWithoutStock
        try {

            const order = {
                amount: totalAmount,
                purchaser: user.email || user.first_name,
                productosSinSuficienteStock,
            }

            if (!productosSinSuficienteStock && productosSinSuficienteStock.trim() !== '' && productosSinSuficienteStock.includes(',')) {
                productsIdsWithoutStock = productosSinSuficienteStock.split(',');
            } else {
                productsIdsWithoutStock = [productosSinSuficienteStock]
            }

            if (user.email) {
                await this.sendPurchaseEmail(user.email, order)
            }

            await this.repository.updateCartProducts(user.cart, productsIdsWithoutStock)
            return this.repository.finishPurchase(order)
        } catch (error) {
            throw error;
        }
    }

    async sendPurchaseEmail(email, order) {
        try {

            const subject = order.productosSinSuficienteStock.length === 0
                ? 'Purchase Order'
                : 'Partial Purchase';

            const htmlContent = order.productosSinSuficienteStock.length === 0
                ? `<div>
               <h1>Thank you ${order.purchaser} for your purchase</h1>
               <p>Total Amount: ${order.amount}</p>
             </div>`
                : `<div>
               <h1>Thank you ${order.purchaser} for your purchase</h1>
               <p>Total Amount: ${order.amount}</p>
               <p>Some products could not be added due to insufficient stock. Other products have been added successfully</p>
               <p>Products without sufficient stock : ${order.productosSinSuficienteStock}</p>
             </div>`;

            await transportGmail.sendMail({
                from: `Shop Ease <${process.env.EMAIL_USER}>`,
                to: email,
                subject,
                html: htmlContent,
                attachments: [],
            });
        } catch (error) {
            throw error
        }
    }

    async updateCartProducts(cid, productsIdsWithoutStock) {
        try {
            return this.repository.updateCartProducts(cid, productsIdsWithoutStock);
        } catch (error) {
            throw error;
        }
    }

    async updateCartProduct(cid, pid, quantity) {
        try {
            const cart = await this.repository.getCartById(cid)
            const product = await productsRepository.getProductById(pid)

            if (!cart) throw new Error('Cart not found')

            if (!product) throw new Error('Product not found in inventory')

            const existingProductInCart = cart[0].products.findIndex((p) => p.product._id.toString() === pid);

            if (existingProductInCart === -1) throw new Error('The product you are trying to update does not exist in the cart')

            return this.repository.updateCartProduct(cid, pid, quantity);
        } catch (error) {
            throw error
        }
    }

    async deleteProductFromCart(cid, pid) {
        try {
            const product = await productsRepository.getProductById(pid)
            const cart = await this.repository.getCartById(cid)

            if (!cart) throw new Error('Cart not found')

            if (!product) throw new Error('Product not found in inventory')

            const existingProductInCart = cart[0].products.findIndex((p) => p.product._id.toString() === pid);

            if (existingProductInCart === -1) throw new Error('The product you are trying to delete does not exist in the cart')

            return this.repository.deleteProductFromCart(cid, pid)
        } catch (error) {
            throw error
        }
    }

    async deleteProductsFromCart(cid) {
        try {
            const cart = await this.repository.getCartById(cid)

            if (!cart) throw new Error('Cart not found')

            if (cart[0].products.length === 0) throw new Error('No products to delete');

            return this.repository.deleteProductsFromCart(cid)
        } catch (error) {
            throw error
        }
    }

    async deleteCart(cid) {
        try {
            const cart = await this.repository.getCartById(cid)

            if (!cart) throw new Error('Cart not found')

            return this.repository.deleteCart(cid)
        } catch (error) {
            throw error
        }
    }
}

module.exports = CartsService

