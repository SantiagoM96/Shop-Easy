const CartsController = require('../controllers/CartsController');
const cartsController = new CartsController()
const BaseRouter = require('./BaseRouter');
const passportCall = require('../utils/passportCall')
class CartsRouter extends BaseRouter {
    init() {
        this.get('/', cartsController.getCarts.bind(cartsController))
        this.get('/:cid', cartsController.getCartById.bind(cartsController))
        this.post('/', cartsController.addCart.bind(cartsController))
        this.post('/:cid/products/:pid', cartsController.addProductToCart.bind(cartsController))
        this.post('/:cid/purchase', passportCall('jwt'), cartsController.finishPurchase.bind(cartsController))
        this.put('/:cid', cartsController.updateCartProducts.bind(cartsController))
        this.put('/:cid/products/:pid', cartsController.updateCartProduct.bind(cartsController))
        this.delete('/:cid/products/:pid', cartsController.deleteProductFromCart.bind(cartsController))
        this.delete('/:cid', cartsController.deleteProductsFromCart.bind(cartsController))
        this.delete('/delete/:cid', cartsController.deleteCart.bind(cartsController))
    }
}

module.exports = CartsRouter