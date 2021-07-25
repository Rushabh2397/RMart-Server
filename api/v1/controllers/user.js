const async = require('async');
const { User } = require('../../../models');
const { validationResult } = require('express-validator');
const { decrypt } = require('../../../utils/encryDecry')
const jwt = require('jsonwebtoken')

module.exports = {

    /**
     * @param {name,email,password} req 
    */
    signup: (req, res) => {
        async.waterfall([
            (nextCall) => {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return nextCall(errors[0].errors.msg)
                }
                nextCall(null, req.body)
            },
            (body, nextCall) => {
                User.findOne({ email: body.email }, (err, user) => {
                    if (err) {
                        return nextCall(err)
                    } else if (user) {
                        return nextCall({
                            message: 'User already exist.'
                        })
                    } else {
                        nextCall(null, body)
                    }
                })
            },
            (body, nextCall) => {
                console
                let newUser = new User(body);
                newUser.save((err, user) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null)
                })
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to register user.'
                })
            }

            res.json({
                status: 'success',
                message: 'User registerd successfuly.'
            })
        })
    },

    /**
     * @param {email,password} req 
    */
    login: (req, res) => {
        async.waterfall([
            (nextCall) => {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return nextCall(errors[0].errors.msg)
                }
                nextCall(null, req.body)
            },
            (body, nextCall) => {
                User.findOne({ email: body.email }, (err, user) => {
                    if (err) {
                        return nextCall(err)
                    } else if (!user) {
                        return nextCall({
                            message: 'Check your email/password.'
                        })
                    } else {
                        let passwordMatched = decrypt(body.password, user.password)
                        if (passwordMatched) {
                            nextCall(null, user)
                        } else {
                            return nextCall({
                                message: 'Check your email/password.'
                            })
                        }
                    }
                })
            },
            (user, nextCall) => {
                let jwtPayload = {
                    _id: user._id,
                    email: user.email
                }
                user = user.toJSON();
                user.accessToken = jwt.sign(jwtPayload, 'secret', {
                    expiresIn : 60 * 60 * 24
                })
                delete user.password;
                nextCall(null, user)

            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to login.'
                })
            }
            res.json({
                status: "success",
                message: "User logged in successfully.",
                data: response
            })
        })
    }
}