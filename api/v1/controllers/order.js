const { User, Cart, Order, Address } = require('../../../models')
const async = require('async')
const config = require('../../../config')
const stripe = require('stripe')('sk_test_51JT841SA7j2p5dnv0YqVWSjwkZP8ba8i7PaCGg7YE1N73rzGo10pFM7mWFxX30waN374RAnnuzTOBbtMHksCudAX00oVCFzvN5');
const { v4: uuidv4 } = require('uuid');




let _self = {

  payment: (req, res) => {
    console.log("req",req.body)
    async.waterfall([
      async () => {
        try {
          let user = await User.findById(req.user._id)
          console.log("user",user)
          let address = await Address.findById(req.body.address_id)
          if(!address){
            return res.status(400).json({
              message :'Something went wrong!!!'
            })
          }
          const customer = await stripe.customers.create({
            email: user.email,
            source: req.body.token.id,
            // name: 'Jenny Rosen',
            // address: {
            // line1: '510 Townsend St',
            // postal_code: '98140',
            // city: 'San Francisco',
            // state: 'CA',
            // country: 'US',
            // }
          });
          if (customer) {
            return [req.body, customer,user,address]
          }
        } catch (error) {
          console.log(error)
          return nextCall(error)
        }

      },
      async ([body, customer,user,address],nextCall) => {
        console.log("body",body,customer)
        try {
          let charge = await stripe.charges.create({
            amount: parseInt(body.amount)*100 ,
            currency: 'INR',
            customer: customer.id,
            // customerName:"energy",
            shipping: {
              name: user.name,
              address: {
                country:body.token.card.country
              }
            },
            //description: 'Rollex'
          }, { idempotencyKey: uuidv4() })
          if (charge) {
            _self.placeOrder(user,address)
            return res.json({
              status: 'success',
              message: "Payment success",
              data: charge
            })
          }
        } catch (error) {
          console.log("err",error)
          return res.status(400).json({
            message : 'Something went wrong!!!'
          })
        }

      }
    ], (err, response) => { })
  },


  /**
   * Api to place user's order.
   * @param {address} 
   */
  placeOrder: (user,address) => {
    async.waterfall([
      // (nextCall) => {
      //   if (!req.body.address_id) {
      //     return nextCall({
      //       message: 'Address id is required.'
      //     })
      //   }
      //   nextCall(null, req.body)
      // },
      (nextCall) => {
        Cart.findOne({ user_id: user._id }, (err, cart) => {
          if (err) {
            return nextCall(err)
          }
          nextCall(null,cart)
        })
      },
      // (body, cart, nextCall) => {
      //   Address.findById(body.address_id, (err, address) => {
      //     if (err) {
      //       return nextCall(err)
      //     }
      //     nextCall(null, cart, address)
      //   })
      // },
      (cart,  nextCall) => {
        let order = new Order({
          order_id: uuidv4(),
          user_id: user._id,
          products: cart.products,
          shipping_address: address,
          products_in_cart: cart.products_in_cart,
          total_cart_value: cart.total_cart_value
        })

        order.save((err, orderInfo) => {
          if (err) {
            console.log("err",err)
            return nextCall(err)
          }
          nextCall(null, null)
        })
      }

    ], (err, response) => {
      // if (err) {
      //   return res.status(400).json({
      //     message: (err && err.message) || 'Oops! Failed to place order.'
      //   })
      // }
      // res.json({
      //   status: 'success',
      //   message: 'Order placed successfully.',
      //   data: response
      // })
    })
  },

  /**
   * Api to get list of user's order.
  */
  getUserAllOrders: (req, res) => {
    async.waterfall([
      (nextCall) => {
        Order.find({ user_id: req.user._id }, (err, orders) => {
          if (err) {
            return nextCall(err)
          }
          nextCall(null, orders)
        })
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
   * @param {orderId} req  
  */
  getOrderDetail: (req, res) => {
    async.waterfall([
      (nextCall) => {
        if (!req.body.orderId) {
          return nextCall({
            message: 'Order id is required.'
          })
        }
        nextCall(null, req.body)
      },
      (body, nextCall) => {
        Order.findById(body.orderId, (err, order) => {
          if (err) {
            return nextCall(err)
          }
          nextCall(null, order)
        })
      }
    ], (err, response) => {
      if (err) {
        return res.status(400).json({
          message: (err && er.message) || 'Oops! Failed to get order detail.'
        })
      }

      res.json({
        status: 'success',
        message: 'Order detail.',
        data: response
      })
    })
  }
}

module.exports = _self