const chai = require('chai')
const supertest = require('supertest')
const uuid = require('uuid')

const expect = chai.expect
const requester = supertest('http://localhost:8080')

describe('Testing ecommerce ShopEasy', () => {
    describe('Test de Products', () => {

        let productMock;

        beforeEach(() => {
            productMock = {
                title: 'Producto de prueba',
                description: 'Descripción',
                code: 'PROD-25',
                price: 21.19,
                status: true,
                stock: 21,
                category: 'Categoría N°1',
                thumbnails: []
            };
        });

        afterEach(() => {
            productMock = null; //se elimina cualquier referencia a la información del producto después de que cada prueba haya finalizado
        });

        it('El endpoint POST /api/products no debe crear un producto ya que se omite algun campo, Ejemplo: title', async () => {
            delete productMock.title
            const {
                statusCode,
                _body
            } = await requester.post('/api/products').send(productMock)
            expect(statusCode).to.be.equal(409)
            expect(_body.status).to.be.equal('error')

        })

        it('El endpoint POST /api/products debe crear un producto correctamente', async () => {
            productMock.code = uuid.v4();
            const {
                statusCode,
                _body
            } = await requester.post('/api/products').send(productMock)
            expect(statusCode).to.be.equal(201)
            expect(_body.status).to.be.equal('success')
        })

        it('El endpoint POST /api/products no debe crear un producto ya que se repite el campo CODE', async () => {
            const {
                statusCode,
                _body
            } = await requester.post('/api/products').send(productMock)
            expect(statusCode).to.be.equal(409)
            expect(_body.status).to.be.equal('error')
        })

    })

    describe('Test de Carts', () => {
        let cid;

        it('El endpoint GET /api/carts/:cid obtiene un carrito determinado via su ID', async () => {
            cid = '6552eee1e5f4c92dde46ad4e';
            const {
                statusCode,
                _body
            } = await requester.get(`/api/carts/${cid}`);
            expect(statusCode).to.be.equal(200);
            expect(_body.status).to.be.equal('success');
            expect(_body.payload[0].products).to.be.an('array');
            expect(_body.payload).to.be.an('array').that.is.not.empty;
        });

        it('El endpoint GET /api/carts/:cid no obtiene el carrito debido a que no existe en la base de datos', async () => {
            cid = '655299f2a7de83b4204d6481';
            const {
                statusCode,
                _body
            } = await requester.get(`/api/carts/${cid}`);
            expect(statusCode).to.be.equal(404);
            expect(_body.status).to.be.equal('error');
        });
    });

    describe('Test de Users', () => {
        let cookie
        let userCredentials
        let userMock

        beforeEach(() => {
            userMock = {
                first_name: 'Nombre',
                last_name: 'Apellido',
                email: `${uuid.v4()}@gmail.com`,
                age: 22,
                password: 'qwerty'
            };
        });

        afterEach(() => {
            userMock = null;
            userCredentials = null;
        });

        it('El endpoint POST /api/sessions/register debe registrar correctamente al usuario', async () => {
            const {
                statusCode,
                _body
            } = await requester.post('/api/sessions/register').send(userMock)

            expect(statusCode).to.be.equal(201);
            expect(_body.status).to.be.equal('success');
        })

        it('El endpoint POST /api/sessions/register no registra al usuario porque faltan campos. Ejemplo: last_name', async () => {
            delete userMock.last_name
            const { statusCode } = await requester.post('/api/sessions/register').send(userMock)
            expect(statusCode).to.be.equal(401);
        })

        it('El endpoint POST /api/sessions debe loguear correctamente al usuario y DEVOLVER UNA COOKIE', async () => {
            userCredentials = {
                email: 'santiagomanuelferrer@gmail.com',
                password: 'qwerty'
            }

            const {
                header,
                statusCode,
                _body
            } = await requester.post('/api/sessions').send(userCredentials);

            expect(statusCode).to.be.equal(201);
            expect(_body.status).to.be.equal('success');
            const authTokenCookie = header['set-cookie'][0];
            cookie = {
                name: authTokenCookie.split('=')[0],
                value: authTokenCookie.split('=')[1]
            }
            expect(cookie.name).to.be.ok.and.eql('authTokenCookie')
            expect(cookie.value).to.be.ok;
        })

        it('El endpoint POST /api/sessions no loguea por credenciales incorrectas. Este ejemplo: contraseña', async () => {
            userCredentials = {
                email: 'santiagomanuelferrer@gmail.com',
                password: 'contraseña incorrecta'
            }

            const {
                statusCode,
                _body } = await requester.post('/api/sessions').send(userCredentials);

            expect(statusCode).to.be.equal(401);
            expect(_body.error).to.be.equal('Incorrect data');
        })

    })
})