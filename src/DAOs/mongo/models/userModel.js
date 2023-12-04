const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    first_name: String,
    last_name: String,
    email: {
        type: String,
        unique: true
    },
    age: Number,
    password: String,
    role: {
        type: String,
        enum: ['USER', 'PREMIUM', 'ADMIN'], //para definir un conjunto válido de valores para este campo
        default: 'USER'
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    documents: {
        type: [
            {
                name: {
                    type: String,
                    required: true
                },
                reference: {
                    type: String,
                    required: true
                }
            }
        ],
        default: []
    },
    documentUploadStatus: {
        type: Boolean,
        default: false
    },
    last_connection: {
        type: Date,
    }
});

module.exports = mongoose.model('users', userSchema)