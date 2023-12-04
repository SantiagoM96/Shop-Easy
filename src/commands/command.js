const { Command } = require('commander')
const config = require('../config/config')
const dotenv = require('dotenv')

const program = new Command()

program
    .option('--mode <mode>', 'Work Mode', 'dev')

program.parse()
const options = program.opts()

dotenv.config({
    path: `.env.${options.mode}`
})

const settings = config()

module.exports = settings