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
            "session_fee": req.body.price,
            "paymentStatus": "Paid",
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

//create Payment
const createPayment = async(req,res)=>{
  try {
     const admin_amount  = req.body.fee * 0.25;
     const doctor_amount = req.body.fee - admin_amount;
     const data = await Payment.create({
      patient: req.body.patientId,
      doctor: req.body.doctorId,
      fee: req.body.fee,
      admin_percentage_amount: admin_amount,
      doctor_percentage_amount: doctor_amount
    })
   res.json({success: true, message: data})
    
  } catch (error) {
    console.log(error.message);
   return res.json({success: false,message: "Internal server error"})
  }
};
//Get all payments
const getPayments = async(req,res)=>{
  try {
    const payments = await Payment.find({patient: req.body.patientId}).populate('doctor', '_id firstName lastName picture_url specialist');
    res.json({success: true, total_payments: payments.length,payments_list: payments});
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}

//delete payment
const deletePayment = async(req,res)=>{
  try {
    
    const result = await Payment.findByIdAndDelete(req.body.paymentId);
    if (!result) {
      return res.json({success: false, message: 'Payment not found'});
    }
    res.json({success: true, message: 'payment deleted successfully'});
    
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}
//Get payment details by id
const paymentDetails = async(req,res)=>{
  try {
    
    const result = await Payment.findById(req.body.paymentId);
    if (!result) {
      return res.json({success: false, message: 'Payment not found'});
    }
    res.json({success: true, payment_details: result});
    
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}



module.exports = {
  CheckoutSession,
  createPayment,
  getPayments,
  deletePayment,
  paymentDetails
};