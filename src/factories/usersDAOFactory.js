const usersDAOMongo = require('../DAOs/mongo/UsersManager.mongo')

const storageMapper = {
    mongo: () => new usersDAOMongo(),
    default: () => new usersDAOMongo()
};

const getUsersDAO = (storage) => {
    const storageFn = storageMapper[storage] || storageMapper.default

    const dao = storageFn()

    return dao
};

module.exports = { getUsersDAO };