class ProductsDTO {
    constructor(products) {
        this.products = products.docs;
        this.page = products.page
        this.totalPages = products.totalPages;
        this.prevPage = products.prevPage;
        this.nextPage = products.nextPage;
        this.hasPrevPage = products.hasPrevPage;
        this.hasNextPage = products.hasNextPage;
        this.prevLink = products.prevPage;
        this.nextLink = products.nextPag;
    }
}

module.exports = ProductsDTO