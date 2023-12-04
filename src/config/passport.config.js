const passport = require('passport')
const githubStrategy = require('../strategies/githubStrategy')
const loginLocalStrategy = require('../strategies/loginLocalStrategy')
const registerLocalStrategy = require('../strategies/registerLocalStrategy')
const {jwtStrategy} = require('../strategies/jwtStrategy')

const initializePassport = () => {
    passport.use('register', registerLocalStrategy)
    passport.use('login', loginLocalStrategy)
    passport.use('github', githubStrategy)
    passport.use('jwt', jwtStrategy)
}

module.exports = initializePassport