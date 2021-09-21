const { Schema, model } = require('mongoose')
const moment = require('moment');



const orderSchema = new Schema({

    user_id: {
        type: Schema.Types.ObjectId
    },
    order_id:{
        type: String
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
    },
    created_at:{
        type: Date
    },
    shipping_address:{
        type: Object
    }
}, { collection: 'order' })


orderSchema.pre('save', function (next) {
    let order = this;
    order.created_at = moment().unix() * 1000;
    next()
})


module.exports = model(orderSchema.options.collection, orderSchema)