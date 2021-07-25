const express = require('express')
const router = express.Router()
const UserController = require('../controllers/user')
const Validation = require('../../../validations')

// User routes

router.post('/auth/signup',Validation.signup(),UserController.signup)
router.post('/auth/login',Validation.login(),UserController.login)










module.exports = router