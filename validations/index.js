const { body } = require('express-validator');


module.exports = {

    signup: () => {
        return ([
            body('name', 'Name is required.').notEmpty(''),
            body('email', 'Email is required.').isEmail().notEmpty(),
            body('password', 'Password is required.').notEmpty()
        ])
    },

    login: () => {
        return ([
            body('email', 'Email is required.').isEmail().notEmpty(),
            body('password', 'Password is required.').notEmpty()
        ])
    }
}
