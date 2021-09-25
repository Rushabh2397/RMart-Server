const async = require('async')
const { Wishlist, Product, moveToCart, Cart } = require('../../../models')
const wishlist = require('../../../models/wishlist')
const config = require('../../../config')

module.exports = {


    /**
     * Api to add product to wishlist.
     * @param {product_id} req  
     */
    addToWishlist: (req, res) => {
        async.waterfall([
            (nextCall) => {
                if (!req.body.product_id) {
                    return nextCall({
                        message: "Product id is required."
                    })
                }
                nextCall(null, req.body)
            },
            (body, nextCall) => {
                Product.findById(body.product_id, (err, product) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, product)
                })
            },
            (product, nextCall) => {
                Wishlist.findOne({ user_id: req.user._id }, (err, wishlist) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, wishlist, product)
                })
            },
            (wishlist, product, nextCall) => {
                if (wishlist) {

                    if (wishlist.products.some(itm => itm._id.toString() == product._id.toString())) {
                        return nextCall({
                            message: 'Product already exist in wishlist.'
                        })
                    }

                    wishlist.products.push({
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        description: product.description,
                        image: product.image,
                        brand: product.brand
                    })

                    Wishlist.findByIdAndUpdate(
                        wishlist._id,
                        { products: wishlist.products },
                        { new: true },
                        (err, updatedWishlist) => {
                            if (err) {
                                return nextCall(err)
                            }
                            nextCall(null, updatedWishlist)
                        }
                    )
                } else {
                    let wishlist = {
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        description: product.description,
                        image: product.image,
                        brand: product.brand
                    }
                    let newWishlist = new Wishlist({
                        user_id: req.user._id,
                        products: wishlist
                    })

                    newWishlist.save((err, savedWishlist) => {
                        if (err) {
                            return nextCall(err)
                        }
                        nextCall(null, savedWishlist)
                    })
                }
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to add to wishlist.'
                })
            }

            res.json({
                status: "success",
                message: "Added to wishlist successfully.",
                data: response
            })
        })
    },


    /**
     * Api to get wishlist of the user.
     * @param {*} req 
    */
    getWishlist: (req, res) => {
        async.waterfall([
            (nextCall) => {
                Wishlist.findOne({ user_id: req.user._id }, (err, wishlist) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, wishlist)
                })
            },
            (wishlist, nextCall) => {
                if (wishlist) {
                    wishlist.products.map(item => {
                        item.image = config.imgUrl+'/products/' + item.image
                    })
                } else {
                    wishlist = []
                }
                nextCall(null, wishlist)
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to get wishlist.'
                })
            }

            res.json({
                status: 'success',
                message: 'Wishlist list.',
                data: response
            })
        })
    },


    /**
     * Api to move product to  user cart.
     * @param {product_id} req 
    */
    removeFromWishlist: (req, res) => {
        async.waterfall([
            (nextCall) => {
                Wishlist.findOne({ user_id: req.user._id }, (err, wishlist) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, req.body, wishlist)
                })
            },
            (body, wishlist, nextCall) => {
                let updatedProducts = wishlist.products.filter(item => item._id != body.product_id)
                Wishlist.findByIdAndUpdate(wishlist._id, { products: updatedProducts }, { new: true }, (err, updated) => {
                    if (err) {
                        return nextCall(err)
                    }
                    if (updated) {
                        updated.products.map(item => {
                            item.image = config.imgUrl+'/products/' + item.image
                        })
                    }


                    nextCall(null, updated)
                })
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to remove product from wishlist.'
                })
            }

            res.json({
                status: 'success',
                message: 'Wishlist list.',
                data: response
            })

        })
    },

    /**
     * Api to move product to  user cart.
     * @param {product_id} req 
    */
    moveToCart: (req, res) => {
        async.waterfall([
            (nextCall) => {
                if (!req.body.product_id) {
                    return nextCall({
                        message: "Product id is required."
                    })
                }
                nextCall(null, req.body)
            },
            (body, nextCall) => {
                Product.findById(body.product_id, (err, product) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, product)
                })
            },
            (product, nextCall) => {
                Cart.findOne({ user_id: req.user._id }, (err, cart) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, cart, product)
                })
            },
            (cart, product, nextCall) => {
                let isProductInCart = cart.products.some((item) => item.id == product._id)
                if (!isProductInCart) {
                    cart.products.push({
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        brand: product.brand,
                        quantity: 1
                    })

                    Cart.findByIdAndUpdate(cart._id, { products: cart.products }, (err, updatedCart) => {
                        if (err) {
                            return nextCall(err)
                        }
                        nextCall(null, product)
                    })
                } else {
                    nextCall(null, product)
                }
            },
            (product, nextCall) => {
                Wishlist.findOne({ user_id: req.user._id }, (err, wishlist) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, wishlist, product)
                })
            },
            (wishlist, product, nextCall) => {
                let updatedWishlist = wishlist.products.filter(item => item._id.toString() !== product._id.toString())
                Wishlist.findByIdAndUpdate(
                    wishlist._id,
                    {
                        products: updatedWishlist
                    },
                    { new: true },
                    (err, updatedUserWishlist) => {
                        if (err) {
                            return nextCall(err)
                        }
                        if (updatedUserWishlist) {
                            updatedUserWishlist.products.map(item => {
                                item.image = config.imgUrl+'/products/' + item.image
                            })
                        }
                        nextCall(null, updatedUserWishlist)
                    }
                )
            }

        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to move product to cart.'
                })
            }

            res.json({
                status: 'success',
                message: 'Product moved to cart.',
                data: response
            })
        })
    }
}