require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cron = require('node-cron');
const moment = require('moment-timezone');
const connectToMongo = require('./db');
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const userModel = require("./Model/User")
const http = require("http");
const { Server } = require("socket.io");
app.use(cors({origin: "*"}));

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
     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
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
          payment_status: "Pagato"
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
                text: `Object: Conferma Appuntamento Video MedicoGentile ${patient.firstName}${patient.lastName}${process.env.BOOKED_APPOINTMENT}`
               // text: `Hi,${patient.firstName}${patient.lastName} this is the confirmation email you have booked the appointment with the Dr.${doctor.firstName}${doctor.lastName} at this date${paymentIntent.metadata.appointment_date}${paymentIntent.metadata.appointment_time}`
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
       
       case 'payment_intent.created':
         break;
     default:
       console.log(`Unhandled event type ${event.type}`);
    }

//     // Return a 200 response to acknowledge receipt of the event
   res.send();
  }
);

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
const fileUpload = require("express-fileupload");
app.use(fileUpload({useTempFiles: true,limits: {fileSize: 500*2024*1024}}))

app.use("/api/specialist",require("./Router/Specialist"));
app.use("/api/favorite",require("./Router/Favorite"));
app.use("/admin",require("./Router/Admin"));
app.use("/api/appointment", require("./Router/Appointment"));
app.use("/api/user/",require("./Router/User"));
app.use("/api/review/",require("./Router/Reviews"));
app.use("/api/payment",require("./Router/Payments"));
app.use("/api/recordings", require("./Router/Recording"));

const Appointment = require("./Model/Appointments")

function create_cron_date(seconds,minute,hour,day_of_the_month,month,day_of_the_week){
  return seconds + " "+minute+" "+hour+" "+day_of_the_month+" "+month+" "+day_of_the_week;
}
//console.log(create_cron_date(0,0,0,2,0,0));
// cron.schedule(
//   create_cron_date('*/5','*','*','*','*','*'),
//   function(){
//     console.log('its time to launch')
//   }
// );


// Function to send notification
// function sendNotification() {
//     console.log("Notification sent at", moment().tz("Europe/Rome").format());
//     // Your notification logic here
// }
// function sendNotification(appointmentDate) {
//     console.log("Notification sent for appointment on", appointmentDate.format('DD MMMM YYYY'));
//     // Your notification logic here
// }

// Schedule the job
// cron.schedule('* * 7 * * *', () => {
//     // Get the current time in Italy
//     const nowInItaly = moment().tz('Europe/Rome');

//     // Check if the current hour in Italy is 9 AM
//     if (nowInItaly.hours() === 7) {
//         sendNotification();
//     }
// }, {
//     timezone: 'Europe/Rome'
// });

// console.log('Cron job scheduled to run at 7 AM Italy time.');

// function scheduleNotification(appointmentDateStr) {
//     // Parse the appointment date
//     const appointmentDate = moment.tz(appointmentDateStr, 'DD MMMM YYYY', 'Europe/Rome');

//     // Calculate the notification time (one day before the appointment)
//     const notificationDate = appointmentDate.clone().subtract(1, 'day').set({ hour: 8, minute: 0, second: 0, millisecond: 0 });

//     // Check if the notification date is in the future
//     if (notificationDate.isBefore(moment().tz('Europe/Rome'))) {
//         console.log('Notification date is in the past. Skipping scheduling.');
//         return;
//     }

//     // Calculate the cron expression
//     const cronExpression = `${notificationDate.second()} ${notificationDate.minute()} ${notificationDate.hour()} ${notificationDate.date()} ${notificationDate.month() + 1} *`;

//     // Schedule the cron job
//     cron.schedule(cronExpression, () => {
//         sendNotification(appointmentDate);
//     }, {
//         timezone: 'Europe/Rome'
//     });

//     console.log('Cron job scheduled for', notificationDate.format('DD MMMM YYYY HH:mm:ss'), 'Italy time.');
// }
// scheduleNotification('29 June 2024');


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

io.on("connection", (socket) => {
//   console.log(`Socket Connected`, socket.id);
//   // Listen for incoming messages from clients
  socket.on("message", (message) => {
    // Broadcast the message to all connected clients
    io.emit("message", message);
  });

       console.log("server is connected")

            socket.on('join-room', (roomId, userId) => {
                console.log(`a new user ${userId} joined room ${roomId}`)
                socket.join(roomId)
                socket.broadcast.to(roomId).emit('user-connected', userId)
            })

            socket.on('user-toggle-audio', (userId, roomId) => {
                socket.join(roomId)
                socket.broadcast.to(roomId).emit('user-toggle-audio', userId)
            })

            socket.on('user-toggle-video', (userId, roomId) => {
                socket.join(roomId)
                socket.broadcast.to(roomId).emit('user-toggle-video', userId)
            })

            socket.on('user-leave', (userId, roomId) => {
                socket.join(roomId)
                socket.broadcast.to(roomId).emit('user-leave', userId)
            })
});



server.listen(process.env.PORT,()=>{
    console.log("Server is connected with",process.env.PORT);
    connectToMongo();
})