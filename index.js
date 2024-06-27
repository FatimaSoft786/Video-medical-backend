require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const connectToMongo = require('./db');
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const userModel = require("./Model/User")

// mail transporter
let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth:{
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

const endpointSecret = process.env.ENDPOINT
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
 async (req, res) => {
   const sig = req.headers['stripe-signature'];
   let event;
   try {
     event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
   } catch (err) {
    console.log(err.message);
     res.status(400).send(`Webhook Error: ${err.message}`);
     return;
   }
    switch (event.type) {
     case 'charge.succeeded': 
     break;
     case 'payment_intent.succeeded':
      console.log("working");
       const paymentIntent = event.data.object;
     const data =    await Appointment.create({
           patient: paymentIntent.metadata.patient,
          doctor: paymentIntent.metadata.doctor,
          fee: paymentIntent.metadata.fee,
          appointment_date: paymentIntent.metadata.appointment_date,
          appointment_time: paymentIntent.metadata.appointment_time,
          payment_status: "Paid"
         });
          const patient = await userModel.findById(
          paymentIntent.metadata.patient
        );
         const doctor = await userModel.findById(
          paymentIntent.metadata.doctor
        );
          let mailOption = {
                from: process.env.SMTP_MAIL,
                to: patient.email,
                subject: "Your appointment has been booked",
                text: `Hi,${patient.firstName}${patient.lastName} this is the confirmation email you have booked the appointment with the Dr.${doctor.firstName}${doctor.lastName} at this date${paymentIntent.metadata.appointment_date}${paymentIntent.metadata.appointment_time}`
            };
            transporter.sendMail(mailOption,function(error){
          if(error){
          return  res.json({success:false, message: error})
          }else{
           console.log("email sent");
          }
            }); 
      console.log(data)
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
app.use(cors({origin: "*"}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const fileUpload = require("express-fileupload");
app.use(fileUpload({useTempFiles: true,limits: {fileSize: 500*2024*1024}}))
app.use(express.json());
app.use("/api/specialist",require("./Router/Specialist"));
app.use("/api/favorite",require("./Router/Favorite"));
app.use("/admin",require("./Router/Admin"));
app.use("/api/appointment", require("./Router/Appointment"));
app.use("/api/user/",require("./Router/User"));
app.use("/api/review/",require("./Router/Reviews"));
app.use("/api/payment",require("./Router/Payments"));

const Appointment = require("./Model/Appointments")
app.listen(process.env.PORT,()=>{
    console.log("Server is connected with",process.env.PORT);
    connectToMongo();
})