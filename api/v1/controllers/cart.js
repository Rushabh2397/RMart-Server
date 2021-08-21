const { Product, Cart, Wishlist } = require('../../../models')
const async = require('async')
const config = require('../../../config')


module.exports = {

    /**
     * Api to add product to cart
     * @param {product_id} req 
    */
    addToCart: (req, res) => {
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
                Cart.findOne({ user_id: req.user._id }, (err, cart) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, body, cart)
                })
            },
            (body, cart, nextCall) => {
                Product.findById(body.product_id, (err, product) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, body, cart, product)
                })
            },
            (body, cart, product, nextCall) => {
                if (cart) {

                    if (cart.products.some((item) => item.id === body.product_id)) {
                        return nextCall({
                            message: "Product already exist in cart."
                        })
                    }

                    cart.products.push({
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        brand: product.brand,
                        quantity: 1
                    })

                    let total_cart_value = parseInt(cart.total_cart_value) + parseInt(product.price);

                    Cart.findByIdAndUpdate(
                        cart._id,
                        {
                            products: cart.products,
                            products_in_cart: cart.products.length,
                            total_cart_value: total_cart_value
                        },
                        { new: true },
                        (err, updatedCart) => {
                            if (err) {
                                return nextCall(err)
                            }
                            updatedCart.products.map(item => {
                                item.image = config.imgUrl + '/products/' + item.image;
                            })
                            nextCall(null, updatedCart)
                        }
                    )

                } else {
                    let newCart = new Cart({
                        user_id: req.user._id,
                        products: [{
                            _id: product._id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            brand: product.brand,
                            quantity: 1
                        }],
                        products_in_cart: 1,
                        total_cart_value: product.price
                    })

                    newCart.save((err, userCart) => {
                        if (err) {
                            return nextCall(err)
                        }
                        nextCall(null, userCart)
                    })
                }
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to add product in cart.'
                })
            }

            res.json({
                status: 'success',
                message: 'Product added to cart.',
                data: response
            })
        })
    },

    /**
     * Api to remove a product from cart.
     * @param {product_id} req  
    */
    removeProductFromCart: (req, res) => {
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
                Cart.findOne({ user_id: req.user._id }, (err, cart) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, body, cart)
                })
            },
            (body, cart, nextCall) => {
                let updatedProducts = cart.products.filter(item => item._id != body.product_id);
                let products_in_cart = updatedProducts.length;
                let total_cart_value = 0;
                updatedProducts.map(item => {
                    total_cart_value += (item.price * item.quantity)
                })

                Cart.findByIdAndUpdate(
                    cart._id,
                    {
                        products: updatedProducts,
                        products_in_cart: products_in_cart,
                        total_cart_value: total_cart_value
                    },
                    { new: true },
                    (err, updatedCart) => {
                        if (err) {
                            return nextCall(err)
                        }
                        nextCall(null, updatedCart)
                    }

                )
            },
            (cart, nextCall) => {
                cart.products.map(item => {
                    item.image = config.imgUrl + '/products/' + item.image;
                })
                nextCall(null, cart)
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to remove  product from cart.'
                })
            }

            res.json({
                status: 'success',
                message: 'Product removed from cart successfully.',
                data: response
            })
        })
    },

    /**
     * Api to empty user's cart.  
    */
    emptyCart: (req, res) => {
        async.waterfall([
            (nextCall) => {
                Cart.findOneAndUpdate(
                    { user_id: req.user._id },
                    {
                        products: [],
                        products_in_cart: 0,
                        total_cart_value: 0
                    },
                    (err, updatedCart) => {
                        if (err) {
                            return nextCall(err)
                        }
                        nextCall(null, updatedCart)
                    }
                )
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to empty cart.'
                })
            }

            res.json({
                status: 'success',
                message: 'Cart emptied successfully.',
                data: response
            })
        })
    },

    /**
     * Api to get user's cart.  
    */
    getUserCart: (req, res) => {
        async.waterfall([
            (nextCall) => {
                Cart.findOne({ user_id: req.user._id }, (err, cart) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, cart)
                })
            },
            (cart, nextCall) => {
                if (cart) {
                    cart.products.map(item => {
                        item.image = config.imgUrl + '/products/' + item.image
                    })
                }
                nextCall(null, cart)
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.message) || "Oops! Failed to get user' cart."
                })
            }

            res.json({
                status: 'success',
                message: 'User cart.',
                data: response
            })
        })
    },

    /**
     * Api to update quantity of product in cart.
     * @param {product_id,qty} req 
    */
    updateProductQty: (req, res) => {
        async.waterfall([
            (nextCall) => {
                if (!req.body.product_id || !req.body.qty) {
                    return nextCall({
                        message: "Product id or quantity is required."
                    })
                }

                nextCall(null, req.body)
            },
            (body, nextCall) => {
                Cart.findOne({ user_id: req.user._id }, (err, cart) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, body, cart)
                })
            },
            (body, cart, nextCall) => {
                let updatedProducts = cart.products.map(item => {
                    if (item._id == body.product_id) {
                        item.quantity = body.qty;
                    }
                    return item
                })
                let total_cart_value = 0;
                updatedProducts.map(item => {
                    total_cart_value += (parseInt(item.price) * parseInt(item.quantity));
                })

                Cart.findByIdAndUpdate(
                    cart._id,
                    {
                        products: updatedProducts,
                        total_cart_value: total_cart_value,
                        products_in_cart: updatedProducts.length
                    },
                    { new: true },
                    (err, updatedCart) => {
                        if (err) {
                            return nextCall(err)
                        }
                        updatedCart.products.map(item => {
                            item.image = config.imgUrl + '/products/' + item.image
                        })
                        nextCall(null, updatedCart)
                    }
                )
            }
        ], (err, response) => {
            if (err) {
                return res.status(400).json({
                    message: (err && err.status) || 'Oops! Failed to update quantity.'
                })
            }

            res.json({
                status: 'success',
                message: 'Product qty updated successful.',
                data: response
            })
        })
    },

    /**
     * Api to move product from cart to wishlist.
     * @param {product_id} req 
    */
    moveToWishlist: (req, res) => {
        async.waterfall([
            (nextCall) => {
                if (!req.body.product_id) {
                    return nextCall({
                        message: "Product id  is required."
                    })
                }

                nextCall(null, req.body)
            },
            (body, nextCall) => {
                Wishlist.findOne({ user_id: req.user._id }, (err, wishlist) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, body, wishlist)
                })
            },
            (body, wishlist, nextCall) => {
                let isExist = wishlist.products.some(item => item._id == body.product_id);
                if (!isExist) {
                    Product.findById(body.product_id, (err, product) => {
                        if (err) {
                            return nextCall(err)
                        }
                        wishlist.products.push({
                            _id: product._id,
                            name: product.name,
                            price: product.price,
                            description: product.description,
                            image: product.image,
                            brand: product.brand
                        })
                        nextCall(null, body, wishlist)
                    })

                } else {
                    nextCall(null, body, wishlist)
                }

            },
            (body, wishlist, nextCall) => {
                Wishlist.findByIdAndUpdate(wishlist._id, { products: wishlist.products }, (err, updatedWishlist) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null,body)
                })
            },
            (body, nextCall) => {
                Cart.findOne({ user_id: req.user._id }, (err, cart) => {
                    if (err) {
                        return nextCall(err)
                    }
                    nextCall(null, body, cart)
                })
            },
            (body, cart, nextCall) => {
                let updatedProducts = cart.products.filter(item => item._id != body.product_id)
                let total_cart_value = 0;
                updatedProducts.map(item => {
                    total_cart_value += (parseInt(item.price) * parseInt(item.quantity));
                })
                Cart.findByIdAndUpdate(
                    cart._id,
                    {
                        products: updatedProducts,
                        total_cart_value: total_cart_value,
                        products_in_cart: updatedProducts.length
                    },
                    { new: true },
                    (err, updatedCart) => {
                        if (err) {
                            return nextCall(err)
                        }
                        updatedCart.products.map(item => {
                            item.image = config.imgUrl + '/products/' + item.image
                        })
                        nextCall(null, updatedCart)
                    })
            }
        ], (err, response) => {
            if (err) {
                console.log("err", err)
                return res.status(400).json({
                    message: (err && err.message) || 'Oops! Failed to move product to wishlist.'
                })
            }

            res.json({
                status: 'success',
                message: 'Moved to wishlist successfully.',
                data: response
            })
        })
    }


}