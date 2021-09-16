const { Cart, Order, Address } = require('../../../models')
const async = require('async')
const config = require('../../../config')
const stripe = require('stripe')('sk_test_51JT841SA7j2p5dnv0YqVWSjwkZP8ba8i7PaCGg7YE1N73rzGo10pFM7mWFxX30waN374RAnnuzTOBbtMHksCudAX00oVCFzvN5');
const { v4: uuidv4 } = require('uuid');




module.exports = {

  payment: (req, res) => {
    async.waterfall([
      async (nextCall) => {
        try {
          console.log("here", req.body)
          const customer = await stripe.customers.create({
            email: 'energy1@yopmail.com',
            source: req.body.id,
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
            return customer
          }
        } catch (error) {
          console.log(error)
          return nextCall(error)
        }

      },
      async (customer) => {
        try {
          let charge = await stripe.charges.create({
            amount: 30 * 100,
            currency: 'INR',
            customer: customer.id,
            // customerName:"energy",
            shipping: {
              name: "energy",
              address: {
                country: req.body.card.country
              }
            },
            description: 'Rollex'
          }, { idempotencyKey: uuidv4() })
          if (charge) {
            return res.json({
              status: 'success',
              message: "Payment success",
              data: charge
            })
          }
        } catch (error) {
          console.log("err", error)
        }

      }
    ], (err, response) => { })
  },


  /**
   * Api to place user's order.
   * @param {address_id} req 
   */
  placeOrder: (req, res) => {
    async.waterfall([
      (nextCall) => {
        if (!req.body.address_id) {
          return nextCall({
            message: 'Address id is required.'
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
        Address.findById(body.address_id, (err, address) => {
          if (err) {
            return nextCall(err)
          }
          nextCall(null, cart, address)
        })
      },
      (cart, address, nextCall) => {
        let order = new Order({
          order_id: uuidv4(),
          user_id: req.user._id,
          products: cart.products,
          shipping_address: address,
          products_in_cart: cart.products_in_cart,
          total_cart_value: cart.total_cart_value
        })

        order.save((err, orderInfo) => {
          if (err) {
            return nextCall(err)
          }
          nextCall(null, orderInfo)
        })
      }

    ], (err, response) => {
      if (err) {
        return res.status(400).json({
          message: (err && err.message) || 'Oops! Failed to place order.'
        })
      }
      res.json({
        status: 'success',
        message: 'Order placed successfully.',
        data: response
      })
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
        if(err){
          return res.status(400).json({
            message : ( err && er.message ) || 'Oops! Failed to get order detail.'
          })
        }

        res.json({
          status : 'success',
          message : 'Order detail.',
          data : response
        })
    })
  }
}