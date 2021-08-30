const async = require('async')
const config = require('../../../config')
const stripe = require('stripe')('sk_test_51JT841SA7j2p5dnv0YqVWSjwkZP8ba8i7PaCGg7YE1N73rzGo10pFM7mWFxX30waN374RAnnuzTOBbtMHksCudAX00oVCFzvN5');
const { v4: uuidv4 } = require('uuid');




module.exports={

    payment : (req,res)=>{
        async.waterfall([
            async (nextCall)=>{
            try {
              console.log("here",req.body)
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
              if(customer){
                return customer
              }
            } catch (error) {
              console.log(error)
              return nextCall(error)
            }
            
          },
          async (customer)=>{
            try {
              let charge = await stripe.charges.create({
                amount: 30 * 100,
                currency: 'INR',
                customer: customer.id,
                // customerName:"energy",
                shipping:{
                  name: "energy",
                  address:{
                    country: req.body.card.country
                  }
                } ,
                description: 'Rollex'
              },{idempotencyKey:uuidv4()})
              if(charge){
                  return res.json({
                    status: 'success',
                    message:"Payment success",
                    data: charge
                  })
              }
            } catch (error) {
              console.log("err",error)
            }
            
          }
        ],(err,response)=>{})
    },
}