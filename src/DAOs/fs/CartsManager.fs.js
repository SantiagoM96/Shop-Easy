const fs = require("fs");

class CartManager {

    constructor(path) {
        this.carts = [];
        this.path = path;
    }

    async addCart() {
        try {
            await this.getCarts()
            const newCart = {
                id: this.carts.length + 1,
                products: [],
            };

            this.carts.push(newCart);
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2));

        } catch (error) {
            throw error;
        }

    }

    async getCarts() {
        try {
            if (!fs.existsSync(this.path)) {
                await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2));
                return []
            }
            const data = await fs.promises.readFile(this.path, "utf-8");
            this.carts = JSON.parse(data);
            return this.carts;
        } catch (error) {
            this.carts = [];
            return this.carts;
        }
    }

    async getCartById(id) {
        try {
            await this.getCarts()
            const cart = this.carts.find((cart) => cart.id === id);
            if (!cart) {
                throw new Error('No se encuentra el carrito')
            }
            return cart
        } catch (error) {
            throw error
        }
    }

    //Permite acceder a la información del inventario en products.json
    async loadInventory() {
        try {
            const productsData = await fs.promises.readFile('./src/products.json', 'utf-8')
            const products = JSON.parse(productsData)
            return products
        } catch (error) {
            throw error
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            const cart = await this.getCartById(cartId)
            const products = await this.loadInventory()
            const product = products.find((p) => p.id === productId)

            if(!product) {
                throw new Error(`No figura en nuestro inventario ese producto`)
            }

            const productToAdd = {
                product: product.id,
                quantity: 1
            }

            const existingProductInCart = cart.products.findIndex(p => p.product === productId);
            //si el índice encontrado es distinto a menos uno entonces existe
            (existingProductInCart !== -1)
                ? cart.products[existingProductInCart].quantity++
                : cart.products.push(productToAdd)

            cart.products.sort((a, b) => a.product - b.product);
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2));
        } catch (error) {
            throw error
        }
    }
}

module.exports = CartManager