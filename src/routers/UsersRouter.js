const UsersController = require('../controllers/UsersController')
const BaseRouter = require('./BaseRouter');
const uploader = require('../middlewares/uploader')
const myUploader = uploader('documents')

class UsersRouter extends BaseRouter {
    constructor() {
        super();
        this.usersController = new UsersController();
    }
    init() {
        this.get('/', async (req, res) => this.usersController.getUsers(req, res))
        this.put('/premium/:uid', async (req, res) => this.usersController.updateUserRole(req, res));
        this.post('/:uid/documents', myUploader.array('documents'), async (req, res) => this.usersController.updateUserDocuments(req, res));
        this.post('/passwordrecovery', async (req, res) => this.usersController.sendEmailRecovery(req, res));
        this.post('/password/reset/:token', async (req, res) => this.usersController.resetPassword(req, res));
        this.delete('/:userId', async (req, res) => this.usersController.deleteUser(req, res));
        this.delete('/', async (req, res) => this.usersController.deleteInactiveUsers(req, res));
    }
}

module.exports = UsersRouter