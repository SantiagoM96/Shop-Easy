const passport = require('passport')
const customError = require('../services/Errors/CustomErrors')
const EErrors = require('../services/Errors/enums')

const passportCall = (strategy) => {
    return (req, res, next) => {
        passport.authenticate(strategy, (err, user, info) => {

            if (err) {
                return next(err);
            }

            if (!user) {
                const errorMessage = (info && info.message) ? info.message : info ? info.toString() : 'Authentication failed';
                const error = customError.createError({
                    name: 'Authentication error',
                    cause: errorMessage,
                    message: errorMessage,
                    code: EErrors.AUTHENTICATION_ERROR
                })
                return next(error)
            }

            req.user = user;
            next();
        })(req, res, next);
    }
}

module.exports = passportCall;