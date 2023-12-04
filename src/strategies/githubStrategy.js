const GithubSt = require('passport-github2')
const UsersRepository = require('../repositories/UsersRepository')
const usersRepository = new UsersRepository()
const { generateToken } = require('../utils/jwt')

const githubStrategy = new GithubSt({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackUrl: `${process.env.BASE_URL}/api/sessions/github-callback`,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await usersRepository.getUserByFilter({ first_name: profile.username });
        if (!user) {
            let data = { first_name: profile.username, last_name: '', email: profile._json.email, age: 18, password: '' }
            const newUser = await usersRepository.createUser(data)
            const token = generateToken({
                userId: newUser._id,
                first_name: newUser.first_name,
                age: newUser.age,
                role: newUser.role,
                cart: newUser.cart
            })
            newUser.token = token
            return done(null, newUser)
        } else {
            const token = generateToken({
                userId: user._id,
                first_name: user.first_name,
                age: user.age,
                role: user.role,
                cart: user.cart
            })
            user.token = token
            return done(null, user)
        }

    } catch (error) {
        return done(error)
    }
})

module.exports = githubStrategy;