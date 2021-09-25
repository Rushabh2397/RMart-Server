const { User, Cart, Order, Address } = require('../../../models')
const async = require('async')
const config = require('../../../config')
const stripe = require('stripe')('sk_test_51JT841SA7j2p5dnv0YqVWSjwkZP8ba8i7PaCGg7YE1N73rzGo10pFM7mWFxX30waN374RAnnuzTOBbtMHksCudAX00oVCFzvN5');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment')
const short = require('short-uuid');



let _self = {

  // payments: (req, res) => {
  //   console.log("req", req.body)
  //   async.waterfall([
  //     async () => {
  //       try {
  //         let user = await User.findById(req.user._id)
  //         console.log("user", user)
  //         let address = await Address.findById(req.body.address_id)
  //         if (!address) {
  //           return res.status(400).json({
  //             message: 'Something went wrong!!!'
  //           })
  //         }
  //         const customer = await stripe.customers.create({
  //           email: user.email,
  //           source: req.body.token.id,
  //           // name: 'Jenny Rosen',
  //           // address: {
  //           // line1: '510 Townsend St',
  //           // postal_code: '98140',
  //           // city: 'San Francisco',
  //           // state: 'CA',
  //           // country: 'US',
  //           // }
  //         });
  //         if (customer) {
  //           return [req.body, customer, user, address]
  //         }
  //       } catch (error) {
  //         console.log(error)
  //         return nextCall(error)
  //       }

  //     },
  //     async ([body, customer, user, address], nextCall) => {
  //       console.log("body", body, customer)
  //       try {
  //         let charge = await stripe.charges.create({
  //           amount: parseInt(body.amount) * 100,
  //           currency: 'INR',
  //           customer: customer.id,
  //           // customerName:"energy",
  //           shipping: {
  //             name: user.name,
  //             address: {
  //               country: body.token.card.country
  //             }
  //           },
  //           //description: 'Rollex'
  //         }, { idempotencyKey: uuidv4() })
  //         if (charge) {
  //           _self.placeOrder(user, address)
  //           return res.json({
  //             status: 'success',
  //             message: "Payment success",
  //             data: charge
  //           })
  //         }
  //       } catch (error) {
  //         console.log("err", error)
  //         return res.status(400).json({
  //           message: 'Something went wrong!!!'
  //         })
  //       }

  //     }
  //   ], (err, response) => { })
  // },


  payment: (req, res) => {
    async.waterfall([
      (nextCall) => {
        User.findById(req.user._id, (err, user) => {
          if (err) {
            return nextCall(err)
          }
          nextCall(null, req.body, user)
        })
      },
      (body, user, nextCall) => {
        Address.findById(body.address_id, (err, address) => {
          if (err) {
            return nextCall(err)
          } else if (address) {
            nextCall(null, body, user, address)
          } else {
            nextCall({
              message: 'Something went wrong!!'
            })
          }
        })
      },
      (body, user, address, nextCall) => {
        if (user.stripe_id) {
          nextCall(null, body, user, address)
        } else {
          stripe.customers.create({
            email: user.email,
            source: body.token.id,
          })
            .then(customer => {
              User.findByIdAndUpdate(user._id, { stripe_id: customer.id }, { new: true }, (err, updatedUser) => {
                if (err) {
                  return nextCall(err)
                }
                nextCall(null, body, updatedUser, address)
              })
            })
            .catch(error => {
              return nextCall(error)
            });
        }
      },
      (body, user, address, nextCall) => {
        stripe.charges.create(
          {
            amount: parseInt(body.amount) * 100,
            currency: 'INR',
            customer: user.stripe_id,
            shipping: {
              name: user.name,
              address: {
                country: body.token.card.country
              }
            },
          }, { idempotencyKey: uuidv4() }
        ).then(res => {
          nextCall(null, body, user, address)
        })
          .catch(error => {
            return nextCall(error)
          })

      },
      (body, user, address, nextCall) => {
        Cart.findOne({ user_id: user._id }, (err, cart) => {
          if (err) {
            return nextCall(err)
          }
          nextCall(null, cart, user, address)
        })
      },
      (cart, user, address, nextCall) => {
        let order = new Order({
          order_id: short.generate(),
          user_id: user._id,
          products: cart.products,
          shipping_address: address,
          products_in_cart: cart.products_in_cart,
          total_cart_value: cart.total_cart_value
        })

        order.save((err, orderInfo) => {
          if (err) {
            return nextCall(err)
          } 
          _self.emptyCart(cart._id)
          nextCall(null, orderInfo)
        })
      }


    ], (err, response) => {
      if (err) {
        return res.status(400).json({
          message: (err && err.message) || 'Oops! Failed to place order'
        })
      }
      res.json({
        status:'success',
        message: 'Order placed successfully',
        data: response
      })
    })
  },

  /**
   * Api to place user's order.
   * @param {address} 
   */
  // placeOrder: (user, address) => {
  //   async.waterfall([
  //     // (nextCall) => {
  //     //   if (!req.body.address_id) {
  //     //     return nextCall({
  //     //       message: 'Address id is required.'
  //     //     })
  //     //   }
  //     //   nextCall(null, req.body)
  //     // },
  //     (nextCall) => {
  //       Cart.findOne({ user_id: user._id }, (err, cart) => {
  //         if (err) {
  //           return nextCall(err)
  //         }
  //         nextCall(null, cart)
  //       })
  //     },
  //     // (body, cart, nextCall) => {
  //     //   Address.findById(body.address_id, (err, address) => {
  //     //     if (err) {
  //     //       return nextCall(err)
  //     //     }
  //     //     nextCall(null, cart, address)
  //     //   })
  //     // },
  //     (cart, nextCall) => {
  //       let order = new Order({
  //         order_id: uuidv4(),
  //         user_id: user._id,
  //         products: cart.products,
  //         shipping_address: address,
  //         products_in_cart: cart.products_in_cart,
  //         total_cart_value: cart.total_cart_value
  //       })

  //       order.save((err, orderInfo) => {
  //         if (err) {
  //           console.log("err", err)
  //           return nextCall(err)
  //         }
  //         nextCall(null, null)
  //       })
  //     }

  //   ], (err, response) => {
  //     // if (err) {
  //     //   return res.status(400).json({
  //     //     message: (err && err.message) || 'Oops! Failed to place order.'
  //     //   })
  //     // }
  //     // res.json({
  //     //   status: 'success',
  //     //   message: 'Order placed successfully.',
  //     //   data: response
  //     // })
  //   })
  // },

  /**
   * Api to get list of user's order.
  */
  getUserAllOrders: (req, res) => {
    async.waterfall([
      (nextCall) => {
        Order.find({ user_id: req.user._id }).sort({created_at:-1}).lean().exec((err, orders) => {
          if (err) {
            return nextCall(err)
          } 
          nextCall(null, orders)
        })
      },
      (orders,nextCall)=>{
        orders.map(order=>{
          order.created_at = moment(order.created_at).format("dddd, MMMM Do YYYY")
        })
        nextCall(null, orders)
      }
    ], (err, response) => {
      if (err) {
        return res.status(400).json({
          message: (err && err.message) || 'Oops! Failed to get order list.'
        })
      }
      res.json({
        status: "success",
        message: "Order's list.",
        data: response
      })
    })
  },

  /**
   * Api to get a specific order detail.
   * @param {order_id} req  
  */
  getOrderDetail: (req, res) => {
    async.waterfall([
      (nextCall) => {
        if (!req.body.order_id) {
          return nextCall({
            message: 'Order id is required.'
          })
        }
        nextCall(null, req.body)
      },
      (body, nextCall) => {
        Order.findById(body.order_id, (err, order) => {
          if (err) {
            return nextCall(err)
          }
          order = order.toJSON();
          order.created_at = moment(order.created_at).format("dddd, MMMM Do YYYY")
          order.products.map(product=>{
            product.image = config.imgUrl + '/products/' + product.image;
          })
          nextCall(null, order)
        })
      },
      
    ], (err, response) => {
      if (err) {
        return res.status(400).json({
          message: (err && err.message) || 'Oops! Failed to get order detail.'
        })
      }

      res.json({
        status: 'success',
        message: 'Order detail.',
        data: response
      })
    })
  },

  emptyCart : (cart_id)=>{
    Cart.findByIdAndUpdate(cart_id,{products:[],products_in_cart:0,total_cart_value:0},(err,updatedCart)=>{})
  }
}

module.exports = _self