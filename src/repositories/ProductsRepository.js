const { getProductsDAO } = require('../factories/productsDAOFactory')
class ProductRepository {
  constructor() {
    this.dao = getProductsDAO(process.env.STORAGE);
  }

  async getProducts(filters, query) {
    return this.dao.getProducts(filters, query);;
  }

  async getProductById(pid) {
    return this.dao.getProductById(pid);
  }

  async getProductByCode(code) {
    return this.dao.getProductByCode(code);
  }

  async addProduct(data) {
    return this.dao.addProduct(data);
  }

  async updateProduct(pid, productData) {
    return this.dao.updateProduct(pid, productData);
  }

  async deleteProduct(pid) {
    return this.dao.deleteProduct(pid);
  }
}

module.exports = ProductRepository;