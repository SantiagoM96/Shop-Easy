const productModel = require('./models/productModel')
const ProductsDto = require('../DTOs/ProductsDTO')
class ProductManagerMongo {
    constructor() {
        this.model = productModel
    }

    async getProducts(filters, query) {
        try {
            const products = await this.model.paginate(filters, query)
            const result = new ProductsDto(products)
            return result
        } catch (error) {
            throw error
        }
    }

    async getProductById(pid) {
        try {
            const product = await this.model.findById(pid)
            if (product) {
                return product.toObject()
            }
        } catch (error) {
            throw error
        }
    }

    async getProductByCode(code) {
        try {
            const product = await this.model.findOne({ code: code });
            return product
        } catch (error) {
            throw error
        }
    }

    async addProduct(data) {
        let owner;

        try {
            if (data.userId === process.env.ADMIN_ID || !data.userId) {
                owner = 'ADMIN';
            } else {
                owner = data.userId || data.uid;
            }
            const newProduct = await this.model.create(
                {
                    title: data.title,
                    description: data.description,
                    code: data.code,
                    price: parseFloat(data.price),
                    status: data.status,
                    stock: data.stock,
                    category: data.category,
                    thumbnails: data.thumbnails || [],
                    owner: owner
                }
            )
            return newProduct
        } catch (error) {
            throw error
        }
    }

    async updateProduct(pid, productData) {
        try {
            const product = await this.getProductById(pid);
            const productUpdated = {
                ...product,
                ...productData,
            };
            productUpdated._id = product._id;
            await this.model.updateOne({ _id: pid }, productUpdated);
            return productUpdated;
        } catch (error) {
            throw error;
        }
    }

    async deleteProduct(pid) {
        try {
            await this.model.deleteOne({ _id: pid })
        } catch (error) {
            throw error
        }
    }

}

module.exports = ProductManagerMongo