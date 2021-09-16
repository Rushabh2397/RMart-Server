const express = require('express')
const router = express.Router()
const UserController = require('../controllers/user')
const ProductController = require('../controllers/product')
const WishController = require('../controllers/wishlist')
const CartController = require('../controllers/cart')
const OrderController = require('../controllers/order')
const isUserAuthenticated = require('../middlewares/userAuthenticated')
const isUserPresent = require('../middlewares/isUserPresent')
const Validation = require('../../../validations')
const { User, Order } = require('../../../models')


router.all('/api/*',isUserAuthenticated,isUserPresent )

// User routes

router.post('/auth/signup',UserController.signup)
router.post('/auth/login',Validation.login(),UserController.login)
router.post('/api/add_address',UserController.addAddress)
router.get('/api/get_user_addresses',UserController.getAllUserAddress)
router.put('/api/update_user_address',UserController.updateUserAddress)

// Product routes

router.post('/auth/get_all_products',ProductController.getAllProducts)
router.post('/auth/get_product',ProductController.getProduct)


// Wishlist routes

router.post('/api/add_to_wishlist',WishController.addToWishlist)
router.get('/api/get_user_wishlist',WishController.getWishlist)
router.post('/api/remove_from_wishlist',WishController.removeFromWishlist)
router.put('/api/move_to_cart',WishController.moveToCart)

// Cart routes

router.post('/api/add_to_cart',CartController.addToCart)
router.get('/api/get_user_cart',CartController.getUserCart)
router.post('/api/remove_from_cart',CartController.removeProductFromCart)
router.post('/api/empty_cart',CartController.emptyCart)
router.post('/api/update_qty',CartController.updateProductQty)
router.post('/api/move_to_wishlist',CartController.moveToWishlist)

// order api's

router.post('/auth/checkout',OrderController.payment)
router.post('/api/place_order',OrderController.placeOrder)
router.get('/api/get_user_all_orders',OrderController.getUserAllOrders)




module.exports = router