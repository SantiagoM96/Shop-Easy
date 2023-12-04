const { transportGmail } = require('../config/nodemailer.config')
const UsersRepository = require('../repositories/UsersRepository')
const { createHash, isValidPassword } = require('../utils/passwordHash')
class UsersService {
    constructor() {
        this.repository = new UsersRepository()
    }

    async getUsers(params) {
        return this.repository.getUsers(params)
    }

    async getUserById(uid) {
        return this.repository.getUserById(uid)
    }

    async getUserByFilter(filter) {
        return this.repository.getUserByFilter(filter)
    }

    async addToMyCart(uid, pid) {
        return this.repository.addToMyCart(uid, pid)
    }

    async createUser(data) {
        return this.repository.createUser(data)
    }

    async resetPassword(uid, password) {
        const user = await this.repository.getUserById(uid)

        if (isValidPassword(password, user.password)) throw new Error('New Password cannot be same as old one')

        const newPassword = createHash(password)
        return this.repository.resetPassword(uid, newPassword)
    }

    async updateUserRole(uid, newRole) {
        const ROLE_PREMIUM = 'PREMIUM'
        try {
            const user = await this.repository.getUserById(uid)
            if (!user) throw new Error('User not found');

            if (user.role === newRole) throw new Error('Already has that role')

            if (newRole === ROLE_PREMIUM) {
                const requiredDocuments = [
                    `${uid}_Identificacion`,
                    `${uid}_Comprobante de domicilio`,
                    `${uid}_Comprobante de estado de cuenta`
                ];

                //el siguiente array contendrá los documentos que están en requiredDocuments pero no en user.documents
                const missingDocuments = requiredDocuments.filter(doc => !user.documents.some(userDoc => userDoc.name === doc));

                //si hay documentos faltantes se procede a
                if (missingDocuments.length > 0) {
                    const splitDocuments = requiredDocuments.map(document => {
                        const [id, type] = document.split('_');
                        return { id, type };
                    });

                    //nuevo array con solo los "tipos" de los archivos que estarían faltando
                    const missingTypes = splitDocuments
                        .filter(doc => missingDocuments.includes(`${doc.id}_${doc.type}`))
                        .map(doc => doc.type);

                    const missingDocumentsMessage = `You are missing the following documents: ${missingTypes.join(', ')}`;
                    throw new Error(missingDocumentsMessage);
                }
            }
            return this.repository.updateUserRole(uid, newRole)
        } catch (error) {
            throw error
        }
    }

    async updateUserLastConnection(user) {
        return this.repository.updateUserLastConnection(user)
    }

    async updateUserDocuments(uid, files) {
        const user = await this.repository.getUserById(uid)
        const documentsToUpload = user.documents || [];

        files.forEach(file => {
            const fileName = file.filename.split('.');
            documentsToUpload.push({
                name: fileName[0],
                reference: `${process.env.BASE_URL}:${process.env.PORT}/img/documents/${file.filename}`,
            });
        });

        return this.repository.updateUserDocuments(uid, documentsToUpload)
    }

    async deleteUser(uid) {
        return this.repository.deleteUser(uid)
    }

    async deleteInactiveUsers() {
        try {
            const inactiveTime = new Date();

            inactiveTime.setMinutes(inactiveTime.getDay() - 2);
            const usersToDelete = await this.repository.getUsers({ last_connection: { $lt: inactiveTime } })

            if (usersToDelete.length === 0) throw new Error('No users to delete')

            for (const user of usersToDelete) {
                if (user.email) {
                    await transportGmail.sendMail({
                        from: `Shop Easy <${process.env.EMAIL_USER}>`,
                        to: user.email,
                        subject: 'Cuenta eliminada por inactividad',
                        html: `<div>
                                    <h1>¡Lo sentimos!</h1>
                                    <p>${user.first_name} ${user.last_name}, tu cuenta ha sido eliminada por tener una inactividad de dos días o más</p>
                                </div>`,
                        attachments: []
                    });
                }

            }

            return this.repository.deleteInactiveUsers(usersToDelete)
        } catch (error) {
            throw error
        }

    }
}

module.exports = UsersService