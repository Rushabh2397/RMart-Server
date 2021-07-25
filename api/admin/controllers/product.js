const { Product } = require('../../../models');
const async = require('async');
const Uploader = require('../../../support/uploader')
const path = require('path')

module.exports = {

    /**
     * Api to add product.
     * @param {name,price,description,image} req 
    */
    addProduct: (req, res) => {
        console.log("Inside add product.")
        async.waterfall([
            (nextCall) => {
                Uploader.getFormFileds(req, nextCall)
            },
            (fields, files, nextCall) => {
                console.log("here....")
                if (Object.keys(files).length === 0) {
                    return nextCall({
                        message: 'Missing parameter.'
                    })
                }
                if (!fields.name || !fields.price || !fields.description) {
                    return nextCall({
                        message: 'Please provide all fields.'
                    })
                }
                nextCall(null, fields, files)
            },
            (body, files, nextCall) => {
                let options = {
                    src: files.image.path,
                    dst: path.resolve(__dirname + '/../../..' + '/uploads/products/'),
                    fileName: Date.now() + files.image.name
                }
                body.image = options.fileName;

                async.series([
                    (cb) => {
                        Uploader.upload(options, cb)
                    },
                    (cb) => {
                        Uploader.remove(options.src, cb)
                    }
                ], (err, result) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, body)
                })
            },
            (body, nextCall) => {
                let product = new Product(body)
                product.save((err, data) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, data)
                })
            }

        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to add product.'
                })
            }

            res.json({
                status: "success",
                message: "Product added successfully.",
                data: response
            })

        })
    },
    
    /**
     *  Api to get all products.
    */
    getAllProduct : (req,res)=>{
        async.waterfall([
            (nextCall)=>{
                Product.find({},(err,products)=>{
                    if(err){
                        return nextCall(err)
                    }
                    nextCall(null,products)
                })
            }
        ],(err,response)=>{
            if(err){
                return res.status(400).json({
                    message : (err && err.message) || 'Oops! Failed to get products.'
                })
            }
            res.json({
                status : "success",
                message: "Product list.",
                data: response
            })
        })

    },
    
    /**
     * Api to get info of a product.
     * @param {product_id} req 
    */
    getProduct : (req,res)=>{
        async.waterfall([
            (nextCall)=>{
                Product.findById(req.body.product_id,(err,product)=>{
                    if(err){
                        return nextCall(err)
                    }
                    nextCall(null,product)
                })
            }
        ],(err,response)=>{
            if(err){
                return res.status(400).json({
                    message : ( err && err.message ) || 'Oops!Failed to get product.'
                })
            }

            res.json({
                status: "success",
                message: "Product info.",
                data: response
            })
        })

    },

    /**
     * Api to remove a product.
     * @param {product_id} req 
    */
    removeProduct: (req, res) => {
        async.waterfall([
            (nextCall) => {
                if (!req.body.product_id) {
                    return nextCall({
                        message: 'Product id is required.'
                    })
                }
                nextCall(null,req.body)
            },
            (body,nextCall)=>{
                Product.findByIdAndDelete(body.product_id,(err)=>{
                    if(err){
                        return nextCall(err)
                    }
                    nextCall(null)
                })
            }
        ], (err, response) => {
            if(err){
                return res.status(400).json({
                    message : ( err && err.message ) || 'Oops! Failed to remove product.'
                })
            }
            res.json({
                status: "success",
                message: "Product removed successfully.",
                data : response 
            })
         })
    }
}