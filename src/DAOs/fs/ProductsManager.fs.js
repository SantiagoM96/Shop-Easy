const fs = require("fs");
const generateId = require('../../utils/generateId');

class ProductManager {
    constructor(path, io) {
        this.products = [];
        this.path = path;
        this.io = io;
    }

    async getProducts() {
        try {
            if (!fs.existsSync(this.path)) {
                await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 2));
                return []
            }
            const data = await fs.promises.readFile(this.path, "utf-8");
            this.products = JSON.parse(data);
            return this.products;
        } catch (error) {
            this.products = [];
            return this.products;
        }
    }

    async addProduct(data) {

        try {
            await this.getProducts();

            if (
                !data.title ||
                !data.description ||
                !data.code ||
                !data.price ||
                !data.status ||
                !data.stock ||
                !data.category
            ) {
                throw new Error('Todos los campos son obligatorios')
            }

            const exist = this.products.find((product) => product.code === data.code);
            if (exist) {
                throw new Error(`Ya existe un producto con el código '${data.code}'`)
            }

            const newId = generateId()

            const newProduct = {
                id: newId,
                title: data.title,
                description: data.description,
                code: data.code,
                price: parseFloat(data.price),
                status: typeof data.status === "boolean" ? data.status : JSON.parse(data.status),
                stock: parseFloat(data.stock) ?? 1,
                category: data.category,
                thumbnails: data.thumbnails ?? []
            }

            this.products.push(newProduct);
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 2));
            this.io.emit('newProduct', JSON.stringify(newProduct))

        } catch (error) {
            throw error;
        }

    }

    async getProductById(id) {
        try {
            await this.getProducts()
            const product = this.products.find((product) => product.id === id);
            if (!product) {
                throw new Error(`El Producto con el ID ${id} no existe`)
            }
            return product
        } catch (error) {
            throw error
        }
    }

    async updateProduct(id, data) {
        try {
            await this.getProducts()
            const productIndex = this.products.findIndex((product) => product.id === id);
            if (productIndex === -1) {
                throw new Error('No se encuentra el producto')
            }
            const product = this.products[productIndex]
            const updatedProduct = {
                ...product,
                ...data
            }

            //No modifica ID
            updatedProduct.id = product.id
            this.products[productIndex] = updatedProduct
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 2));

        } catch (error) {
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            await this.getProducts();
            const productIndex = this.products.findIndex((product) => product.id === id);
            if (productIndex === -1) {
                throw new Error('No se encuentra el producto')
            }
            this.products.splice(productIndex, 1);
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 2));

            this.io.emit('productDeleted', id);

        } catch (error) {
            throw error;
        }
    }
}

module.exports = ProductManager