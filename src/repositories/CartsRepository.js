const { getCartsDAO } = require('../factories/cartsDAOFactory')

class CartsRepository {
    constructor() {
        this.dao = getCartsDAO(process.env.STORAGE);
    }

    async getCarts() {
        return this.dao.getCarts();
    }

    async getCartById(id) {
        return this.dao.getCartById(id)
    }

    async addCart() {
        return this.dao.addCart()
    }

    async addProductToCart(cid, pid, userId) {
        return this.dao.addProductToCart(cid, pid, userId)
    }

    async finishPurchase(data) {
        return this.dao.finishPurchase(data)
    }

    async updateCartProducts(cid, productsIdsWithoutStock) {
        return this.dao.updateCartProducts(cid, productsIdsWithoutStock)
    }

    async updateCartProduct(cid, pid, quantity) {
        return this.dao.updateCartProduct(cid, pid, quantity);
    }

    async deleteProductFromCart(cid, pid) {
        return this.dao.deleteProductFromCart(cid, pid)
    }

    async deleteProductsFromCart(cid) {
        return this.dao.deleteProductsFromCart(cid)
    }

    async deleteCart(cid){
        return this.dao.deleteCart(cid)
    }

}

module.exports = CartsRepository;
