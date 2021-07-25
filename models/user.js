const { Schema,model } = require('mongoose')
const moment = require('moment');
const { encrypt } = require('../utils/encryDecry')


const userSchema = new Schema({

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
}, { collection: 'user' })

userSchema.pre('save', function (next) {
    let user = this;
    user.password = encrypt(user.password);
    user.created_at = user.updated_at = moment().unix() * 1000;
    next()
})

module.exports = model(userSchema.options.collection,userSchema)