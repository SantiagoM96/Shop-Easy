const productsDAOMongo = require('../DAOs/mongo/ProductManager.mongo')

const storageMapper = {
    mongo: () => new productsDAOMongo(),
    default: () => new productsDAOMongo()
};

const getProductsDAO = (storage) => {
    const storageFn = storageMapper[storage] || storageMapper.default

    const dao = storageFn()

    return dao
};

module.exports = { getProductsDAO };