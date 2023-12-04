const passportJWT = require('passport-jwt')

const JWTStrategy = passportJWT.Strategy
const extractJWT = passportJWT.ExtractJwt

const headerExtractor = (req) => {
    const cookies = req.headers && req.headers.cookie ? req.headers.cookie.split(';') : [];
    let authTokenValue;

    cookies.forEach(cookie => {
        const [key, value] = cookie.trim().split('=');
        if (key === 'authTokenCookie') {
            authTokenValue = value;
        }
    });

    return authTokenValue;
};

const jwtStrategy = new JWTStrategy({
    jwtFromRequest: extractJWT.fromExtractors([headerExtractor]),
    secretOrKey: process.env.JWT_KEY
}, (jwtPayload, done) => {
    try {
        done(null, jwtPayload)
    } catch (error) {
        return done(error)
    }

})

module.exports = { headerExtractor, jwtStrategy } 