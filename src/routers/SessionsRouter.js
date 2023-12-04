const passport = require('passport')
const BaseRouter = require('./BaseRouter');
const UserDto = require('../DAOs/DTOs/UserDTO')
const passportCall = require('../utils/passportCall');
const { authorizationMiddleware } = require('../middlewares/usersMiddlewares');

class SessionRouter extends BaseRouter {
    init() {

        this.get('/current', passportCall('jwt'), authorizationMiddleware('ADMIN'), (req, res) => {
            try {
                const currentUser = req.user
                const first_name = currentUser.first_name
                const last_name = currentUser.last_name || ''
                const age = currentUser.age
                const userDto = new UserDto(first_name, last_name, age)
                res.status(200).json(userDto)
            } catch (error) {
                res.sendError(500, 'No user', error)
            }
        })

        this.get('/github', passport.authenticate('github', {
            scope: ['user:email']
        }));

        this.get('/github-callback', passport.authenticate('github', { session: false }), (req, res) => {
            const token = req.user.token;
        
            return res.cookie('authTokenCookie', token, {
                maxAge: 60 * 60 * 1000
            }).redirect('/home')
        });

        this.post('/register', passportCall('register'), async (req, res) => {
            try {
                return res.sendSuccess(201, 'The user registered successfully!');
            } catch (error) {
                if (!res.headersSent) {
                    return res.sendError(500, 'Error register', error);
                }
            }
        });

        this.post('/', passportCall('login'), async (req, res) => {
            const { token, user } = req.user
            try {
                return res.cookie('authTokenCookie', token, {
                    maxAge: 60 * 60 * 1000
                }).sendSuccess(201, user);

            } catch (error) {
                return res.sendError(500, error);
            }
        })

    }
}

module.exports = SessionRouter