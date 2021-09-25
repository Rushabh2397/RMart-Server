const Stripe = require('stripe');
const config = require('../../config')
const stripe = Stripe(config.stripeSecretKey);


module.exports = {

    createSession : async ()=>{
        return  await stripe.checkout.sessions.create({
            success_url: 'https://localhost:3000/success',
            cancel_url: 'https://example.com/cancel',
            payment_method_types: ['card'],
            line_items: [
              {price: 'price_H5ggYwtDq4fbrJ', quantity: 2},
            ],
            mode: 'payment',
          });
          
    }
}
