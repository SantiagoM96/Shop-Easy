const mongoose = require('mongoose')

const messageSchema = mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true,
    },
    content: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('messages', messageSchema)