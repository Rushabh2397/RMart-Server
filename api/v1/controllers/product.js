const { Product } = require('../../../models')
const async = require('async')


module.exports = {

    getAllProducts: (req, res) => {
        async.waterfall([
            (nextCall) => {
                Product.find({}, (err, products) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, products)
                })
            },
            (products,nextCall)=>{
                products.map(item=>{
                    item.image = 'http://localhost:5000/uploads/products/' + item.image
                })
                nextCall(null,products)
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed get products.'
                })
            }
            res.json({
                status: "success",
                message: 'Product list.',
                data: response
            })
        })
    },

    getProduct: (req, res) => {
        async.waterfall([
            (nextCall) => {
                Product.findById(req.body.product_id, (err, product) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, product)
                })
            }

        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed get product detail.'
                })
            }
            res.json({
                status: "success",
                message: 'Product detail.',
                data: response
            })
        })
    }
}