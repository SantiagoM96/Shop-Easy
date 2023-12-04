const generateProductErrorInfo = (product) => {
    return `Una o más de las siguientes propiedades es incorrecta:
        * title: Debe ser tipo String, se recibió: ${product.title}
        * description: Debe ser tipo String, se recibió: ${product.description}
        * code: Debe ser tipo String, se recibió: ${product.code}
        * price: Debe ser tipo Number, se recibió: ${product.price}
        * status: Debe ser tipo Boolean, se recibió: ${product.status}
        * stock: Debe ser tipo Number, se recibió ${product.stock}
        * category: Debe ser tipo String, se recibió ${product.category}
    `
}

const generateEntityNotFoundError = (id, entity) => {
    if (entity === 'cart') {
        return `Cart with id "${id}" not found`;
    } else if (entity === 'product') {
        return `Product with id "${id}" not found in inventory`;
    } else if (entity === 'productCart') {
        return `Product with id "${id}" not found in the cart`;
    }
};

module.exports = { generateProductErrorInfo, generateEntityNotFoundError }