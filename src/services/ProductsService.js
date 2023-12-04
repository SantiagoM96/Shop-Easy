
const ProductsRepository = require('../repositories/ProductsRepository');
const CustomError = require('./Errors/CustomErrors')
const EErrors = require('./Errors/enums');
const { transportGmail } = require('../config/nodemailer.config');
const UsersRepository = require('../repositories/UsersRepository')
const usersRepository = new UsersRepository()
class ProductsService {
    constructor() {
        this.repository = new ProductsRepository();
    }

    async getProducts(filters, query) {
        return this.repository.getProducts(filters, query);
    }

    async getProductById(pid) {
        return this.repository.getProductById(pid);
    }

    async addProduct(data) {

        const exist = await this.repository.getProductByCode(data.code);

        if (exist) {
            throw new Error(`There is already a product with the code ${data.code}`)
        }

        if (
            !data.title ||
            !data.description ||
            !data.code ||
            !data.price ||
            data.status === undefined ||
            data.status === null ||
            data.status === '' ||
            !data.stock ||
            !data.category
        ) {
            throw new Error(`All the fields are required`)
        }

        const newProduct = await this.repository.addProduct(data);
        return newProduct
    }

    async updateProduct(pid, productData, userId) {
        console.log(productData);
        console.log(pid);
        const product = await this.repository.getProductById(pid)

        if (!product) {
            const error = CustomError.createError({
                name: 'Updating product error',
                cause: 'Product not found',
                message: 'Product not found',
                code: EErrors.DATABASE_ERROR
            });
            throw error
        }

        if (userId !== '1' && userId && userId !== product.owner) {
            throw new Error('You are not the owner of this product to modify or delete it.')
        }

        return this.repository.updateProduct(pid, productData);
    }

    async deleteProduct(pid, userId) {
        try {
            const product = await this.repository.getProductById(pid)
            if (!product) {
                throw new Error('Product not found');
            }

            if (userId !== '1' && userId && userId !== product.owner) {
                throw new Error('You are not the owner of this product to modify or delete it.')
            }

            if (product.owner !== 'ADMIN') {
                const ownerUser = await usersRepository.getUserById(product.owner)
                if (ownerUser && ownerUser.role === 'PREMIUM' && ownerUser.email) {
                    await transportGmail.sendMail({
                        from: `Shop Ease <${process.env.EMAIL_USER}>`,
                        to: ownerUser.email,
                        subject: 'Product Deletion Notification',
                        html: `<div>
                             <p>Dear Premium User,</p>
                             <p>We regret to inform you that your product "${product.title}" has been deleted by the administrator.</p>
                             <p>Thank you for your understanding.</p>
                         </div>`,
                        attachments: []
                    })
                }
            }
            return this.repository.deleteProduct(pid);
        } catch (error) {
            throw error
        }
    }
}

module.exports = ProductsService