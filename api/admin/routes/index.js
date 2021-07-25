const express = require('express')
const router = express.Router()
const ProductController = require('../controllers/product')



router.post('/auth/add_product',ProductController.addProduct)










module.exports = router