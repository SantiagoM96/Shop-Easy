const BaseRouter = require('./BaseRouter');
const ProductsController = require('../controllers/ProductsController');
const uploader = require('../middlewares/uploader');
const myUploader = uploader('products')
const CustomError = require('../services/Errors/CustomErrors');
const { generateProductErrorInfo } = require('../services/Errors/info');
const EErrors = require('../services/Errors/enums');
const { generateProducts } = require('../utils/faker');
const numberOfProducts = 100;
let products = Array.from({ length: numberOfProducts }, () => generateProducts());

class ProductsRouter extends BaseRouter {
    constructor(io) {
        super();
        this.io = io;
        this.productsController = new ProductsController(io);
    }

    init() {
        this.get('/mockingproducts', async (req, res) => {
            res.send({ quantity: products.length, payload: products });
        });

        this.post('/mockingproducts', async (req, res, next) => {
            const newProduct = req.body;
            if (
                !newProduct.title ||
                !newProduct.description ||
                !newProduct.code ||
                !newProduct.price ||
                !newProduct.status ||
                !newProduct.stock ||
                !newProduct.category
            ) {
                const error = CustomError.createError({
                    name: 'Product creation error',
                    cause: generateProductErrorInfo(newProduct),
                    message: 'Error trying to create Product',
                    code: EErrors.INVALID_TYPE_ERROR,
                });
                return next(error);
            }
            products.push({ ...newProduct, thumbnails: null });
            res.send({ message: 'Producto agregado con éxito', newProduct });
        });

        this.get('/', (req, res) => this.productsController.getProducts(req, res));
        this.get('/:pid', (req, res, next) => this.productsController.getProductById(req, res, next));
        this.post('/:uid', myUploader.array('thumbnails'), (req, res, next) => this.productsController.addProduct(req, res, next));
        this.put('/:pid', (req, res) => this.productsController.updateProduct(req, res));
        this.delete('/:pid', (req, res) => this.productsController.deleteProduct(req, res));
    }
}

module.exports = ProductsRouter;
