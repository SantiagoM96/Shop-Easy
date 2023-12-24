const BaseRouter = require('./BaseRouter')
const ProductsService = require('../services/ProductsService')
const productsService = new ProductsService()
const CartsService = require('../services/CartsService')
const cartsService = new CartsService()
const UsersService = require('../services/UsersService')
const usersService = new UsersService()
const { authorizationMiddleware, isAuth } = require('../middlewares/usersMiddlewares');
const { verifyToken } = require('../utils/jwt')
const passportCall = require('../utils/passportCall')

class ViewsRouter extends BaseRouter {

    handleProductsRoutes = async (req, res, viewName) => {
        const user = req.user;
        let noAdmin = false
        const filters = {};
        const { page = 1, limit = 10, sort, category, availability } = req.query;
        const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};
        const availabilityOption = availability === 'available' ? true : availability === 'notavailable' ? false : undefined;
        const query = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sortOption,
        };

        if (category) {
            filters.category = category;
        }

        if (availability) {
            filters.status = availabilityOption;
        }

        if (user.role !== 'ADMIN') {
            noAdmin = true
        }

        try {
            const productsData = await productsService.getProducts(filters, query);
            const products = productsData.products.map(p => p.toObject());
            const locals = {
                title: viewName === 'productsAndCartViews/products' ? 'Products' : 'Real Time Products',
                products: products,
                productsData,
                user,
                noAdmin,
                generatePaginationLink: (page) => {
                    const newQuery = { ...req.query, ...filters, page: page };
                    return `/${viewName.split('/')[1]}?` + new URLSearchParams(newQuery).toString();
                },
            };

            res.renderView({
                view: viewName,
                locals: locals,
            });
        } catch (error) {
            res.renderView({
                view: 'error', locals: { title: 'Error', errorMessage: error.message },
            });
        }
    }

    init() {

        this.get('/home', passportCall('jwt'), authorizationMiddleware(['ADMIN', 'USER', 'PREMIUM']), async (req, res) => {
            const user = req.user;
            let title = 'Shop Easy Coderhouse';
            let roles = [];

            if (user.role === 'PREMIUM') {
                roles.premiumRole = true
            } else if (user.role === 'ADMIN') {
                roles.adminRole = true
            } else {
                roles.userRole = true
            }

            try {
                res.renderView({
                    view: 'home',
                    locals: { title, user, roles },
                });
            } catch (error) {
                res.renderView({
                    view: 'error',
                    locals: { title: 'Error', errorMessage: error.message },
                });
            }
        });

        this.get('/realtimeproducts', passportCall('jwt'), authorizationMiddleware(['ADMIN', 'PREMIUM']), async (req, res) => {
            this.handleProductsRoutes(req, res, 'productsAndCartViews/realTimeProducts');
        });

        this.get('/products', passportCall('jwt'), authorizationMiddleware(['USER', 'PREMIUM']), async (req, res) => {
            this.handleProductsRoutes(req, res, 'productsAndCartViews/products');
        });

        this.get('/products/:pid', passportCall('jwt'), authorizationMiddleware(['USER', 'PREMIUM']), async (req, res) => {
            const user = req.user
            const { pid } = req.params
            try {
                const product = await productsService.getProductById(pid)
                res.renderView({ view: 'productsAndCartViews/productDetail', locals: { title: 'Product Detail', product, user } })
            } catch (error) {
                res.renderView({
                    view: 'error', locals: { title: 'Error', errorMessage: error.message },
                });
            }
        })

        this.get('/carts/:cid', passportCall('jwt'), authorizationMiddleware(['USER', 'PREMIUM']), async (req, res) => {
            const user = req.user
            const { cid } = req.params
            try {
                const cart = await cartsService.getCartById(cid);

                if (req.user.cart !== cid) {
                    const errorMessage = 'You do not have permission to view this cart'
                    res.renderView({
                        view: 'error', locals: { title: 'Error', errorMessage: errorMessage },
                    });
                }
                const productsInCart = cart[0].products.map(p => p.toObject());
                let { totalQuantity, totalPrice } = productsInCart.reduce((accumulator, item) => {
                    accumulator.totalQuantity += item.quantity;
                    accumulator.totalPrice += item.quantity * item.product.price;

                    return accumulator;
                }, { totalQuantity: 0, totalPrice: 0 });

                totalPrice = totalPrice.toFixed(2);
                if (cart[0].products.length === 0) {
                    const noProducts = true;
                    res.renderView({ view: 'productsAndCartViews/cartDetail', locals: { title: 'Cart Detail', noProducts, user } });
                } else {
                    res.renderView({ view: 'productsAndCartViews/cartDetail', locals: { title: 'Cart Detail', productsInCart, user, totalPrice, totalQuantity } });
                }

            } catch (error) {
                res.renderView({
                    view: 'error', locals: { title: 'Error', errorMessage: error.message },
                });
            }
        })

        this.get('/carts/:cid/purchase', passportCall('jwt'), authorizationMiddleware(['USER', 'PREMIUM']), async (req, res) => {
            const user = req.user
            const { cid } = req.params
            try {
                const cart = await cartsService.getCartById(cid);

                if (req.user.cart !== cid) {
                    const errorMessage = 'You do not have permission to view this cart'
                    res.renderView({
                        view: 'error', locals: { title: 'Error', errorMessage: errorMessage },
                    });
                }

                const productsInCart = cart[0].products.map((item) => {
                    const product = item.product;
                    const quantity = item.quantity;
                    const totalProductPrice = product.price * quantity;
                    return {
                        product: product.toObject(),
                        quantity,
                        totalProductPrice,
                    };
                });

                const { totalQuantity, totalPrice } = cart[0].products.reduce((accumulator, item) => {
                    accumulator.totalQuantity += item.quantity;
                    accumulator.totalPrice += item.quantity * item.product.price;

                    return accumulator;
                }, { totalQuantity: 0, totalPrice: 0 });

                res.renderView({ view: 'productsAndCartViews/checkout', locals: { title: 'Checkout', user, productsInCart, totalPrice, totalQuantity } });
            } catch (error) {
                res.renderView({
                    view: 'error', locals: { title: 'Error', errorMessage: error.message },
                });
            }
        })

        this.get('/carts/:cid/checkout', passportCall('jwt'), authorizationMiddleware(['USER', 'PREMIUM']), async (req, res) => {
            const user = req.user
            const { cid } = req.params
            try {
                if (req.user.cart !== cid) {
                    const errorMessage = 'You do not have permission to view this information'
                    res.renderView({
                        view: 'error', locals: { title: 'Error', errorMessage: errorMessage },
                    });
                }

                res.renderView({ view: 'productsAndCartViews/checkout', locals: { title: 'Checkout', user } })
            } catch (error) {
                res.renderView({
                    view: 'error', locals: { title: 'Error', errorMessage: error.message },
                });
            }
        })

        this.get('/chat', passportCall('jwt'), authorizationMiddleware('USER'), async (req, res) => {
            try {
                res.renderView({ view: 'chat', locals: { title: 'Chat' } })
            } catch (error) {
                res.renderView({
                    view: 'error', locals: { title: 'Error', errorMessage: error.message },
                });
            }
        })

        this.get('/register', isAuth, async (req, res) => {
            try {
                res.renderView({ view: 'loginSystem/register', locals: { title: 'Register' } })
            } catch (error) {
                res.renderView({
                    view: 'error', locals: { title: 'Error', errorMessage: error.message },
                });
            }
        })

        this.get('/', isAuth, async (req, res) => {
            try {
                res.renderView({ view: 'loginSystem/login', locals: { title: 'Login' } })
            } catch (error) {
                res.renderView({
                    view: 'error', locals: { title: 'Error', errorMessage: error.message },
                });
            }
        })

        this.get('/passwordrecovery', isAuth, async (req, res) => {
            try {
                res.renderView({ view: 'loginSystem/passwordRecovery', locals: { title: 'Recovery Password' } })
            } catch (error) {
                res.renderView({
                    view: 'error', locals: { title: 'Error', errorMessage: error.message },
                });
            }
        })

        this.get('/password/reset/:token', isAuth, async (req, res) => {
            const { token } = req.params
            try {
                await verifyToken(token)
                res.renderView({ view: 'loginSystem/reset', locals: { title: 'Reset Password' } })
            } catch (error) {
                if (error.message === 'jwt expired') {
                    error.message = 'The password reset link has expired'
                }
                res.renderView({
                    view: 'error', locals: { title: 'Error', errorMessage: error.message },
                });
            }
        })

        this.get('/profile', passportCall('jwt'), authorizationMiddleware(['USER', 'ADMIN', 'PREMIUM']), async (req, res) => {
            const user = req.user
            try {
                res.renderView({ view: 'loginSystem/profile', locals: { user, title: 'Profile' } })
            } catch (error) {
                res.renderView({
                    view: 'error', locals: { title: 'Error', errorMessage: error.message },
                });
            }
        })

        this.get('/logout', passportCall('jwt'), async (req, res) => {
            const user = req.user
            try {
                if (req.user.userId !== process.env.ADMIN_ID) {
                    await usersService.updateUserLastConnection(user);
                }
                res.clearCookie('authTokenCookie');
                res.redirect('/')
            } catch (error) {
                res.renderView({
                    view: 'error', locals: { title: 'Error', errorMessage: error.message },
                });
            }
        });

        this.get('/error', async (req, res) => {
            const errorMessage = req.query.errorMessage || 'An error has occurred';
            res.renderView({
                view: 'error', locals: { title: 'Error', errorMessage: errorMessage }
            });
        });

        this.get('/users', passportCall('jwt'), authorizationMiddleware('ADMIN'), async (req, res) => {
            const user = req.user
            try {
                const users = await usersService.getUsers()
                let noUsers = false
                if (!users) noUsers = true
                res.renderView({ view: 'users', locals: { title: 'Users', users, noUsers, user } })
            } catch (error) {
                res.renderView({
                    view: 'error', locals: { title: 'Error', errorMessage: error.message },
                });
            }
        })

        this.get('*', (req, res) => {
            res.renderView({
                view: 'notFound', locals: { title: 'Not Found' }
            });
        });

    }
}

module.exports = ViewsRouter