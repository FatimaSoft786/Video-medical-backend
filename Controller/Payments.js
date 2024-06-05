const Payment = require("../Model/Payment");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const CheckoutSession = async (req, res) => { 
  try {
    console.log("api call")
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: req.body.items.map((item) => {
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: item.name,
                description: item.description,
               
              },
              unit_amount: item.price * 100,
            },
            quantity: item.quantity
          }
        }),
        payment_intent_data: {
          metadata: {
            "patientId": req.body.patientId,
            "doctorId": req.body.doctorId,
            "service": req.body.service,
            "visit_fee": req.body.price,
            "paymentStatus": "received",
            "paymentMode": "card"
          }
        },
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel"
      });
      res.status(200).json({url: session.url})
  } catch (error) {
    res.status(500).send(error.message)
  }
};
module.exports = {
  CheckoutSession
};