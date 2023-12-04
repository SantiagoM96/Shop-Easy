const { Router } = require('express')

class BaseRouter {
    constructor() {
        this.router = Router()
        this.init()
    }

    getRouter() {
        return this.router
    }

    init() { }

    get(path, ...callbacks) {
        this.router.get(path, this.generateCustomResponses, this.applyCallbacks(callbacks))
    }

    post(path, ...callbacks) {
        this.router.post(path, this.generateCustomResponses, this.applyCallbacks(callbacks))
    }

    put(path, ...callbacks) {
        this.router.put(path, this.generateCustomResponses, this.applyCallbacks(callbacks))
    }

    delete(path, ...callbacks) {
        this.router.delete(path, this.generateCustomResponses, this.applyCallbacks(callbacks))
    }

    applyCallbacks(callbacks) {
        return callbacks.map(callback => (...params) => {

            try {
                callback.apply(this, params)
            } catch (error) {
                console.log(error)
            }
        })
    }

    generateCustomResponses = (req, res, next) => {
        res.renderView = (options) => {
            const { view, locals } = options
            locals.style = 'styles.css'
            res.render(view, locals)
        }
        res.sendSuccess = (status, payload) => res.status(status).json({ status: 'success', payload })
        res.sendError = (status, error, detail) => {
            const response = {
                status: 'error',
                error,
            };
            if (detail) {
                response.detail = detail;
            }
            return res.status(status).json(response);
        };
        next()
    }

}

module.exports = BaseRouter