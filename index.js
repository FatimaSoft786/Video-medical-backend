require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors({origin: "*"}));
app.use(express.json());
const connectToMongo = require('./db');
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



const paymentModel = require("./Model/Payment")



const fileUpload = require("express-fileupload");
app.use(fileUpload({useTempFiles: true,limits: {fileSize: 500*2024*1024}}))
app.use("/api/patient",require("./Router/Patient"));
app.use("/api/doctor",require("./Router/Doctor"));
app.use("/api/specialist",require("./Router/Specialist"));
app.use("/api/payment",require("./Router/Payments"));
app.use("/api/favorite",require("./Router/Favorite"));
app.use("/admin",require("./Router/Admin"));
app.use("/api/appointment", require("./Router/Appointment"));
app.use("/api/auth/",require("./Router/User"));




const endpointSecret = process.env.ENDPOINT
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
 async (req, res) => {
   const sig = req.headers['stripe-signature'];
   let event;
   try {
     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
   } catch (err) {
     res.status(400).send(`Webhook Error: ${err.message}`);
     return;
   }
    switch (event.type) {
     case 'charge.succeeded': 
     break;
     case 'payment_intent.succeeded':
       const paymentIntent = event.data.object;
         await paymentModel.create({
           patientId: paymentIntent.metadata.patientId,
          doctorId: paymentIntent.metadata.doctorId,
          session_fee: paymentIntent.metadata.session_fee,
          service: paymentIntent.metadata.service,
         
         })
         const post = await bookingModel.findById(
          paymentIntent.metadata.patientId
        );
        post.payment_status = "Paid"
       
      const data =  await post.save();
      console.log(data)
      // console.log("metadata",paymentIntent.metadata.plan)
       break;
     case 'payment_method.attached':
       const paymentMethod = event.data.object;
      
       break;
       case 'charge.succeeded': 
       break;
       case 'payment_intent.created':
         break;
     default:
       console.log(`Unhandled event type ${event.type}`);
    }

//     // Return a 200 response to acknowledge receipt of the event
   res.send();
  }
);




app.listen(process.env.PORT,()=>{
    console.log("Server is connected with",process.env.PORT);
    connectToMongo();
})