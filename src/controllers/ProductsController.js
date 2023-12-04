const ProductsService = require('../services/ProductsService')
const CustomError = require('../services/Errors/CustomErrors')
const EErrors = require('../services/Errors/enums');
class ProductsController {
    constructor(io) {
        this.service = new ProductsService()
        this.io = io
    }

    async getProducts(req, res) {
        const filters = {};
        const { page = 1, limit = 10, sort, category, availability } = req.query;
        const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};
        const availabilityOption =
            availability === 'available' ? true : availability === 'notavailable' ? false : undefined;
        const query = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sortOption,
        };

        try {
            if (category) {
                filters.category = category;
            }

            if (availability) {
                filters.status = availabilityOption;
            }

            const products = await this.service.getProducts(filters, query);

            if (products.length === 0) {
                return res.sendError(404, 'Error fetching products', 'Products not found');
            }

            const generatePageLink = (page) => {
                const newQuery = { ...req.query, ...filters, page: page };
                return '/api/products?' + new URLSearchParams(newQuery).toString();
            };

            const result = {
                ...products, prevLink: products.prevPage ? generatePageLink(products.prevPage) : null,
                nextLink: products.nextPage ? generatePageLink(products.nextPage) : null,
            }

            return res.sendSuccess(200, result);
        } catch (error) {
            return res.sendError(500, 'Error fetching products', error);
        }
    }

    async getProductById(req, res, next) {
        const { pid } = req.params;
        try {
            const product = await this.service.getProductById(pid);
            if (!product) {
                const error = CustomError.createError({
                    name: 'Error fetching product',
                    cause: `Product with id ${pid} not found`,
                    message: `Product with id ${pid} not found`,
                    code: EErrors.DATABASE_ERROR
                });
                throw error
            }
            return res.sendSuccess(200, product);
        } catch (error) {
            next(error)
        }
    }

    async addProduct(req, res) {
        const newProductData = req.body;
        try {
            if (req.files && Array.isArray(req.files)) {
                newProductData.thumbnails = req.files.map((file) => file.path);
            } else {
                newProductData.thumbnails = [];
            }

            const productoNuevo = await this.service.addProduct(newProductData);

            this.io.emit('newProduct', JSON.stringify(productoNuevo))
            return res.sendSuccess(201, 'Successfully added');
        } catch (error) {
            if (error.message === 'All the fields are required' || error.message === `There is already a product with the code ${newProduct.code}`) {
                return res.sendError(409, error.message);
            }
            return res.sendError(500, error.message);
        }
    }

    async updateProduct(req, res) {
        const { pid } = req.params;
        const { productData, userId } = req.body;
        try {
            const productUpdated = await this.service.updateProduct(pid, productData, userId);
            this.io.emit('updateProductInView', productUpdated);
            return res.sendSuccess(200, 'Successfully updated');
        } catch (error) {
            if (error.message === 'Product not found') {
                return res.sendError(404, error.message);
            }
            if (error.code === 11000) {
                return res.sendError(409, `The code ${productData.code} is already in use`);
            }
            return res.sendError(500, error.message);
        }
    }

    async deleteProduct(req, res) {
        const { pid } = req.params;
        const { userId } = req.body
        try {
            await this.service.deleteProduct(pid, userId);
            req.logger.info('Succcessfully deleted')
            this.io.emit('productDeleted', pid)
            return res.sendSuccess(200, 'Successfully deleted');
        } catch (error) {
            req.logger.error('Error deleting product')
            if (error.message === 'Product not found') {
                return res.sendError(404, error.message);
            }
            if (error.message === 'You are not the owner of this product to modify or delete it.') {
                return res.sendError(409, error.message);
            }
            return res.sendError(500, error.message);
        }
    }
}

module.exports = ProductsController;