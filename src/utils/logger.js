const winston = require('winston')
const settings = require('../commands/command')
const environment = settings.environment

const customLevelsOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: 'red',
        error: 'yellow',
        warning: 'blue',
        info: 'green',
        http: 'magenta',
        debug: 'cyan'
    }
}
const createLogger = (environment) => {
    const transports = []

    if (environment === 'prod') {
        transports.push(new winston.transports.Console({ level: 'info' }))
        transports.push(new winston.transports.File({ filename: './src/logs/errors.log', level: 'error' }))
    } else if (environment === 'dev') {
        transports.push(new winston.transports.Console({ level: 'debug' }));
    }

    const logger = winston.createLogger({
        levels: customLevelsOptions.levels,
        transports: transports,
        format: winston.format.combine(
            winston.format.colorize({ colors: customLevelsOptions.colors }),
            winston.format.simple()
        ),
    })
    return logger
}

const logger = createLogger(environment)

const addLogger = (req, res, next) => {
    req.logger = logger
    req.logger.http(`${req.method} on ${req.url} - ${new Date().toLocaleDateString()}`);
    next()
}

module.exports = addLogger