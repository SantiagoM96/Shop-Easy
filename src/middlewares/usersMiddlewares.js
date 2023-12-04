const customError = require('../services/Errors/CustomErrors')
const EErrors = require('../services/Errors/enums')
const { headerExtractor } = require('../strategies/jwtStrategy')

const isAuth = (req, res, next) => {
    const authTokenValue = headerExtractor(req)
    if (authTokenValue) {
        return res.redirect('/profile');
    }
    return next();
}

const authorizationMiddleware = (roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            const error = customError.createError({
                name: 'Authorization error',
                cause: 'You do not have authorization for this resource',
                message: 'You do not have authorization for this resource',
                code: EErrors.AUTHORIZATION_ERROR
            })
            return next(error)
        }

        next()
    };
};

module.exports = { isAuth, authorizationMiddleware }