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
        description: {
            type: String
        },
        image: {
            type: String
        },
        brand: {
            type: String
        }
    }]
}, { collection: 'wishlist' })



module.exports = model(wishlistSchema.options.collection, wishlistSchema)