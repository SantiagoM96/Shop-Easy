const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
        set: value => parseInt(value),
    },
    category: {
        type: String,
        required: true,
    },
    thumbnails: [
        { type: String, }
    ],
    owner: {
        type: String,
        default: 'ADMIN'
    },

})


mongoose.plugin(mongoosePaginate)

module.exports = mongoose.model('products', productSchema)