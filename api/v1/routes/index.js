const express = require('express')
const router = express.Router()
const UserController = require('../controllers/user')
const Validation = require('../../../validations')
const ProductController = require('../controllers/product')
const WishController = require('../controllers/wishlist')
const isUserAuthenticated = require('../middlewares/userAuthenticated')
const isUserPresent = require('../middlewares/isUserPresent')

router.all('/api/*',isUserAuthenticated,isUserPresent )

// User routes

router.post('/auth/signup',Validation.signup(),UserController.signup)
router.post('/auth/login',Validation.login(),UserController.login)


// Product routes

router.get('/auth/get_all_products',ProductController.getAllProducts)
router.post('/auth/get_product',ProductController.getProduct)


// Wishlist routes

router.post('/api/add_to_wishlist',WishController.addToWishlist)
router.get('/api/get_user_wishlist',WishController.getWishlist)
router.post('/api/remove_from_wishlist',WishController.removeFromWishlist)







module.exports = router