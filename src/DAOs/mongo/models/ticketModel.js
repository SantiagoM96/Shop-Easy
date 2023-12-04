const mongoose = require('mongoose')

const ticketSchema = mongoose.Schema({
    code: {
        type: String,
        unique: true,
    },
    purchase_dateTime: {
        type: Date,
        default: Date.now,
        required: true,
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('tickets', ticketSchema)