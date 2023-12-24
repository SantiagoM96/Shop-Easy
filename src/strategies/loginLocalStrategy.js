const local = require('passport-local')
const UsersRepository = require('../repositories/UsersRepository')
const usersRepository = new UsersRepository()
const { isValidPassword } = require('../utils/passwordHash');
const { generateToken } = require('../utils/jwt');

const LocalStrategy = local.Strategy;

const hardcodedUser = {
    userId: process.env.ADMIN_ID,
    first_name: 'Usuario',
    last_name: 'Admin',
    email: process.env.ADMIN_USER,
    password: process.env.ADMIN_PASSWORD,
    role: 'ADMIN',
    age: 30,
};

const loginLocalStrategy = new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {

            if (hardcodedUser.email === email && hardcodedUser.password === password) {
                const token = generateToken({
                    userId: hardcodedUser.userId,
                    role: hardcodedUser.role,
                    first_name: hardcodedUser.first_name,
                    last_name: hardcodedUser.last_name,
                    email: hardcodedUser.email,
                    age: hardcodedUser.age
                })

                hardcodedUser.token = token
                return done(null, hardcodedUser)
            }

            let user = await usersRepository.getUserByFilter({ email })

            if (!user) {
                return done(null, false, { message: 'The user does not exist in the system' })
            }

            if (!isValidPassword(password, user.password)) {
                return done(null, false, { message: 'Incorrect data' })
            }

            await usersRepository.updateUserLastConnection(user)
            delete user.password

            const token = generateToken({
                userId: user._id,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age,
                cart: user.cart
            })
            user.token = token
            return done(null, user)
        } catch (error) {
            return done(error)
        }
    }
);

module.exports = loginLocalStrategy