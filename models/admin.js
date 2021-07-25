const { Schema,model } = require('mongoose')
const moment = require('moment');
const { encrypt } = require('../utils/encryDecry')


const adminSchema = new Schema({

    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
}, { collection: 'admin' })

adminSchema.pre('save', function (next) {
    let admin = this;
    admin.password = encrypt(user.password);
    admin.created_at = admin.updated_at = moment().unix() * 1000;
    next()
})

module.exports = model(adminSchema.options.collection,adminSchema)