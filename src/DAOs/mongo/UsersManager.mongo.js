const userModel = require('./models/userModel')
const CartsService = require('../../services/CartsService')
const cartsService = new CartsService()
const { createHash } = require('../../utils/passwordHash')

class UserManager {
    constructor() {
        this.model = userModel
    }

    async getUsers(params) {
        try {
            const users = await this.model.find(params || {})
            return users
        } catch (error) {
            throw error
        }
    }

    async getUserById(uid) {
        try {
            const user = await this.model.findOne({ _id: uid });
            if (!user) throw new Error('User not found')
            return user
        } catch (error) {
            throw error;
        }
    }

    async getUserByFilter(filter) {
        try {
            const user = await this.model.findOne(filter);
            return user
        } catch (error) {
            throw error;
        }
    }

    async addToMyCart(uid, pid) {
        try {
            const user = await this.model.findOne({ _id: uid })

            const cart = await cartsService.getCartById(user.cart)

            if (!cart) {
                throw new Error('Cart not found')
            } else {
                await cartsService.addProductToCart(user.cart, pid)
            }

        } catch (error) {
            throw error
        }
    }

    async createUser(data) {
        try {
            const newCart = await cartsService.addCart()

            const newUser = await this.model.create({
                first_name: data.first_name,
                last_name: data.last_name,
                age: parseInt(data.age),
                email: data.email || null,
                password: data.password !== '' ? createHash(data.password) : undefined,
                cart: newCart._id
            })

            return newUser
        } catch (error) {
            throw error
        }
    }

    async resetPassword(uid, password) {
        try {
            await this.model.updateOne({ _id: uid }, { password })

        } catch (error) {
            throw error
        }
    }

    async updateUserRole(uid, newRole) {
        try {
            const user = await this.model.updateOne({ _id: uid }, { role: newRole })
            return user
        } catch (error) {
            throw error
        }
    }

    async updateUserLastConnection(user) {
        const userId = user.userId || user._id
        try {
            const userToUpdate = await this.model.findOne({ _id: userId })
            if (!userToUpdate) throw new Error('User not found');
            await this.model.updateOne({ _id: userId }, { last_connection: new Date() })
        } catch (error) {
            throw error
        }
    }

    async updateUserDocuments(uid, updatedDocuments) {
        try {
            const user = await this.getUserById(uid)

            const previousDocumentStatus = user.documents && user.documents.length > 0;

            const newDocumentStatus = await this.model.updateOne({ _id: uid }, { documents: updatedDocuments })

            if (!previousDocumentStatus && newDocumentStatus) { //si el estado anterior era false y el nuevo true entonces actualizar
                await this.model.updateOne({ _id: uid }, { documentUploadStatus: true });
            }
        } catch (error) {
            throw error
        }
    }

    async deleteUser(uid) {
        try {
            const user = await this.getUserById(uid)

            await cartsService.deleteCart(user.cart)

            await this.model.deleteOne({ _id: uid });
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async deleteInactiveUsers(usersToDelete) {
        try {

            const usersIdsToDelete = usersToDelete.map(user => user._id)
            if (usersToDelete.length === 0) throw new Error('No users in database to delete')
            for (const userId of usersIdsToDelete) {
                const user = await this.model.findOne({ _id: userId });
                if (user.cart) {
                    await cartsService.deleteCart(user.cart);
                }
            }
            const result = await this.model.deleteMany({ _id: { $in: usersIdsToDelete } });

            return result.deletedCount
        } catch (error) {
            throw error
        }
    }
}

module.exports = UserManager