const async = require('async');
const { User, Address } = require('../../../models');
const { validationResult } = require('express-validator');
const { decrypt, encrypt } = require('../../../utils/encryDecry')
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
                req.body.email = req.body.email.toLowerCase()
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
                req.body.email = req.body.email.toLowerCase();
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
                    expiresIn: 60 * 60 * 24
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
    },

    addAddress: (req, res) => {
        async.waterfall([
            (nextCall) => {
                if (!req.body.street1 || !req.body.city || !req.body.state || !req.body.pincode || !req.body.country) {
                    return nextCall({
                        message: 'Please provide all the required fields.'
                    })
                }
                nextCall(null, req.body)
            },
            (body, nextCall) => {
                let address = new Address({
                    user_id: req.user._id,
                    line1: body.street1,
                    line2: body.street2,
                    postal_code: body.pincode,
                    city: body.city,
                    state: body.state,
                    country: body.country
                })

                address.save((err, adr) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, adr)
                })
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to add address.'
                })
            }

            res.json({
                status: 'success',
                message: 'User address added successfully.',
                data: response
            })
        })
    },

    getAllUserAddress: (req, res) => {
        async.waterfall([
            (nextCall) => {
                Address.find({ user_id: req.user._id }).sort({ created_at: -1 }).exec((err, addresses) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, addresses)
                })
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to get user addresses.'
                })
            }

            res.json({
                status: 'success',
                message: 'User address list.',
                data: response
            })
        })
    },

    updateUserAddress: (req, res) => {
        async.waterfall([
            (nextCall) => {
                if (!req.body.address_id) {
                    return nextCall({
                        message: "Address id is required."
                    })
                }
                nextCall(null, req.body)
            },
            (body, nextCall) => {
                Address.findByIdAndUpdate(
                    body.address_id,
                    {
                        line1: body.street1,
                        line2: body.street2,
                        postal_code: body.pincode,
                        city: body.city,
                        state: body.state,
                        country: body.country
                    },
                    { new: true },
                    (err, updatedAddress) => {
                        if (err) {
                            return nextCall(err)
                        }
                        nextCall(null, updatedAddress)
                    }
                )
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to update address.'
                })
            }

            res.json({
                status: 'success',
                message: 'Address updated successfully.',
                data: response
            })
        })
    },

    /**
     * 
     * @param {newPassword,password} req 
    */
    changePassword: (req, res) => {
        async.waterfall([
            (nextCall) => {
                if (!req.body.newPassword || !req.body.password) {
                    return nextCall({
                        message: 'All fileds are required.'
                    })
                }
                nextCall(null, req.body)
            },
            (body, nextCall) => {
                User.findById(req.user._id, (err, user) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, body, user)
                })
            },
            (body, user, nextCall) => {
                let passwordMatched = decrypt(body.password, user.password)
                let newPassword = encrypt(body.newPassword)
                if (passwordMatched) {
                    User.findByIdAndUpdate(user._id, { password: newPassword }, (err, updatedUser) => {
                        if (err) {
                            return nextCall(err)
                        }
                        nextCall(null, null)
                    })
                } else {
                    nextCall({
                        message: "Your old password doesn't match."
                    })
                }
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to update password.'
                })
            }

            res.json({
                status: 'success',
                message: 'Password updated successfully.'
            })
        })
    },
    
    /**
     * 
     * @param {name,email,mobile} req
    */
    updateProfile: (req, res) => {
        async.waterfall([
            (nextCall)=>{
                User.findOne({_id:{$ne:req.user._id},email:req.body.email},(err,user)=>{
                    if(err){
                        return nextCall(err)
                    } else if(user){
                        return nextCall({
                            message : 'User with these email id already exist.'
                        })
                    } else{
                        nextCall()
                    }
                })
            },
            (nextCall) => {
                User.findByIdAndUpdate(
                    req.user._id,
                    {
                        name: req.body.name,
                        email: req.body.email,
                        mobile: req.body.mobile
                    },
                    (err, updatedUser) => {
                        if (err) {
                            return nextCall(err)
                        }
                        nextCall(null, updatedUser)
                    }
                )
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to update user details.'
                })
            }

            res.json({
                status: 'success',
                message: 'Profile updated successfully.',
                data: response
            })
        })
    }
}