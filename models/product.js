const { Schema, model } = require('mongoose')
const moment = require('moment');
const { encrypt } = require('../utils/encryDecry')


const productSchema = new Schema({

    name: {
        type: String
    },
    price: {
        type: Number
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    brand: {
        type: String
    },
    created_at: {
        type: Date
    },
    type :{
        type: String,
        enum : ['Male','Female','Unisex']
    },
    updated_at: {
        type: Date
    }
}, { collection: 'product' })

productSchema.pre('save', function (next) {
    let product = this;
    product.created_at = product.updated_at = moment().unix() * 1000;
    next()
})

module.exports = model(productSchema.options.collection, productSchema)