const { faker } = require('@faker-js/faker')

faker.location = 'es'

const generateProducts = () => {
    return {
        id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        code: faker.string.alphanumeric(length = 10),
        price: faker.commerce.price(),
        stock: faker.number.int(100),
        category: faker.commerce.department(),
        thumbnails: faker.image.url()
    }
}

module.exports = { generateProducts }