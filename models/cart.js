const { Schema, model } = require('mongoose')
const moment = require('moment');
const { encrypt } = require('../utils/encryDecry')


const wishlistSchema = new Schema({

    user_id: {
        type: Schema.Types.ObjectId
    },
    products: [{
        _id: {
            type: Schema.Types.ObjectId
        },
        name: {
            type: String
        },
        price: {
            type: Number
        },
        image: {
            type: String
        },
        brand: {
            type: String
        },
        quantity:{
            type: Number
        }
    }],
    products_in_cart:{
        type: Number
    },
    total_cart_value:{
        type: Number
    }
}, { collection: 'cart' })



module.exports = model(wishlistSchema.options.collection, wishlistSchema)