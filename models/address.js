const { Schema, model } = require('mongoose')
const moment = require('moment');
const { encrypt } = require('../utils/encryDecry')


const addressSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId
    },
    line1: {
        type: String
    },
    line2: {
        type: String
    }, 
    postal_code: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    country: {
        type: String
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
}, { collection: 'address' })

addressSchema.pre('save', function (next) {
    let address = this;
    address.created_at = address.updated_at = moment().unix() * 1000;
    next()
})

module.exports = model(addressSchema.options.collection, addressSchema)