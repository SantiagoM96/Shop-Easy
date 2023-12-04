const { transportGmail } = require('../config/nodemailer.config')
const UsersService = require('../services/UsersService')
const { generateToken, verifyToken } = require('../utils/jwt')
class UsersController {
    constructor() {
        this.service = new UsersService()
    }

    async getUsers(req, res) {
        try {
            const users = await this.service.getUsers()
            return res.sendSuccess(200, users)
        } catch (error) {
            return res.sendError(500, 'Error fetching users', error)
        }
    }

    async updateUserDocuments(req, res) {
        const { uid } = req.params
        const { files } = req
        try {
            if (files.length === 0 || !files || !Array.isArray(files)) return res.sendError(409, 'No file or files to upload')
            await this.service.updateUserDocuments(uid, files)
            return res.sendSuccess(200, 'User files updated successfully')
        } catch (error) {
            if (error.message === 'User not found') return res.sendError(404, error.message)
            return res.sendError(500, 'Error uploading documents')
        }
    }

    async updateUserRole(req, res) {
        const { uid } = req.params
        const { newRole } = req.body
        try {
            if (!newRole) return res.sendError(409, 'Please, send a valid user role');
            await this.service.updateUserRole(uid, newRole)
            return res.sendSuccess(200, 'User role updated successfully')
        } catch (error) {
            if (error.message.includes('You are missing the following documents') || error.message === 'Already has that role') {
                return res.sendError(409, error.message);
            }
            return res.sendError(500, error);
        }
    }

    async sendEmailRecovery(req, res) {
        const { email } = req.body
        try {
            const user = await this.service.getUserByFilter({ email })
            if (!user) {
                return res.sendError(404, 'The entered email does not correspond to any registered user')
            }
            const token = generateToken({
                userId: user._id
            })

            const resetLink = `http://localhost:${process.env.PORT}/password/reset/${token}`;

            await transportGmail.sendMail({
                from: `Shop Easy < ${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Password Recovery',
                html: `<div>
                            <h1>Password Recovery</h1>
                            <button><a href="${resetLink}">Reset Password</a></button>
                        </div>`,
                attachments: []
            });


            return res.sendSuccess(200, 'Email sent successfully')
        } catch (error) {
            return res.sendError(500, 'Email sending error')
        }
    }

    async resetPassword(req, res) {
        const { token } = req.params
        const { newPassword } = req.body
        try {
            const decodedToken = await verifyToken(token)

            const userId = decodedToken.userId

            await this.service.resetPassword(userId, newPassword)

            return res.sendSuccess(200, 'Password reset successfully');
        } catch (error) {
            if (error.message === 'New Password cannot be same as old one') {
                return res.sendError(409, error.message)
            }
            if (error.message === 'User not found') {
                return res.sendError(404, 'The user with that email does not exist')
            }
            return res.sendError(500, 'Error resetting password');
        }
    };

    async deleteUser(req, res) {
        const { userId } = req.params
        try {
            await this.service.deleteUser(userId)
            res.sendSuccess(200, 'User account deleted')
        } catch (error) {
            console.log(error);
            return res.sendError(500, 'Error deleting user');
        }
    }

    async deleteInactiveUsers(req, res) {
        try {
            const usersDeleted = await this.service.deleteInactiveUsers()
            res.sendSuccess(200, `${usersDeleted} users deleted`)
        } catch (error) {
            if (error.message === 'No users in database') return res.sendError(409, 'No users in datatabase to delete')
            return res.sendError(500, 'Error deleting inactive users');
        }
    }

}

module.exports = UsersController