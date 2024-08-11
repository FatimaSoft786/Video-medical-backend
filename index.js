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
const axios = require("axios")
app.use(cors({origin: "*"}));

let token = "";
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

const {JWT} = require("google-auth-library");
const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];
const client = new JWT({
    email: "firebase-adminsdk-aqks0@video-medical-visit.iam.gserviceaccount.com",
    key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDJADS7AibFQmI1\nVJ+y7kYhTKZ1I4povjoRF+RR+wfvJJo7g4LHWsW3/chyePdHDtsvcgEkBc0ya2nG\nUmrli/uXliA50dmLSpkGMNd9T9w9LELsoSED+byMGLG4LqSsYotHHFpIPXVFo8zR\nSJHzYU4czVjS5zDDhX2kgndQYXADmsE6CYxRtuU/bs19IAHe26JHvJt0qYM+UXas\n7+aLtPpuUqgTxjM9D7SAgwEL9ujjzzwHFw2fpHzKTW5SJmGC1KUDATXfrLnYc4IL\ne4AqdwqRbb0+x5GWj4pCwarF2CNosq+Zf0AsHePDEwZF8e2nBXrI3Qkggs71wkS2\ncsiN7eu9AgMBAAECggEAKq5OxCQTkAEF4h2vUJssjJ8eXJLYrd+w7FbGrorP1z3O\nO1N0ZnkVsXlkAjzCA1Z6AAPlDp1lwm5RFmIDXW1hVgG0o5p2J5AGWOxvoaYe1eWL\na3xWiqXR3ezTdhD/ejRtr0KrwBm+yHQdBpaymTvhDpgjI5ugfPAgaxmiFNEv7C+k\nhvP+ITUZvqXi1uHRmbWoqG4mlZVbBxRCV9CZrlCWS39J1j2u0Hj6sazAY09XWiLG\nGq1J3Bs5Iwbc1MGtyJLMxfmB0AJMNBC3ijmSlNh25GEadXu8nXcRaLEeWGU5s63V\nVOaDu1UBHE4nVA5eE2Lul/4zt1xMc5t0qCJhoJ2ZMQKBgQDy4lJgFU3mQWVz01uZ\nBNeo6g6TUdSTDEDH8GoUlK+QzpX8aFOO1oBYEZwJP1Ucx9OhkatxZnB+6rl7mWqy\nbRvhAIsfy6qp8k9bjlW70DLVC71Elr3mylVgUYC8nJJMvlzrs2rXGbuhcst5yfFk\nhdQ58aStXgP1wt4NVGELyn2LkQKBgQDT2uGrikeeKpDOwtLtwq4qNthkcRHvwobB\n1swqZ3N7SqL9EgbdcWmmuxk0pGaf1fKmPyVIVzkz0aSlGAqYrcQJL7k2MTfvTeGH\nNdIL/xProRu55mQlGSenyaDv5jzDVnkC5TRDzgjdq1aW5anqs2D2iqbMUn9LG2k2\nfBD/KIwPbQKBgDjwnecwl2aXhjU1I5An9nb/CBO5Z2Bhyv4UeooAoXgNNlRKEOy3\nlLcQycfRNR7eKdsCz3JyVYUrefhj6wORWKvS+MqncIcO61PHdonlMUWIzwI5ZKOq\nY4GFGe0dt56OMjJ/iViMC9S5mMIgeZrbVPmQkM6j78G5wVzWnzmoau5BAoGAeMrp\nNvyd/xG4BRvSVlxVH56r3QEXQARC/4ywVlEr6BVTP0YjAenjWnx9T6WZGfNL6fxB\nDrEk3WXgIX3GtO0GxFIgoUSI5voZ6BUI0Ww7+HKgs2somHpyQNnW2FIHPT01vC/h\nj/OO3I0PzvPd4QMr+wZtOjyjdbiIUdeFfWaqDTUCgYAKJ6ohl1k0YNhDYE7XzJCC\nF+lbPmJojz1EN6MSKnBxAXgpiy89hMip4WkDLOYO9MzGeQmhnCkcpKd8C+eDYMNh\nMSSqKUKbxFbDdg3htY+oMgfukHNbcif2aL+QCO8Y3nMr215g1L5LdK5yLn5AB2gJ\nwdum30s4bpH36UDQs+H3Nw==\n-----END PRIVATE KEY-----\n",
    scopes: SCOPES
})
async function getAccessToken(){
    const tokens = await client.authorize();
    token = tokens.access_token;
    console.log(token);
    return tokens.access_token
}
getAccessToken();

async function sendPushNotification(deviceToken,accessToken){
  const notification = {
    "title": "Test",
    "body": "Hi notificAtion"
  }
    const message = {
      "token": deviceToken,
      "notification": notification
    }
    const messageJSON = {message}
   const headers = {
  'Authorization':  `Bearer ${accessToken}`,
  'Content-Type': 'application/json',

};
    axios.post('https://fcm.googleapis.com/v1/projects/video-medical-visit/messages:send',messageJSON, { headers })
  .then(response => {
    console.log('Response data:', response.data);
  })
  .catch(error => {
    console.error('Error making POST request:', error);
  });
    
}
//sendPushNotification("fiWynh9SPlAScGCP9hrwpR:APA91bFPJVT-UddJm8m58gOa0JRIChbX8tSTAO_akUrMqkUkaeOl4-vfozGlkW9gf1-Aawbna6ij0KwHXONp5v1hg1LAQFpvqvV-KqbiXkw-poIVcfveN8Phl5rvjZ21WzqZYKLIbzqW","ya29.c.c0ASRK0GY5110K37sSjyJ4rssQv9B5cVk259Wpk-I-5O6mtvExaHP1RStnTzftmHza98_SceZ2YkPTP6uN3-lWBjfChD-SI_R8cts9sCK5Riz5GqPiYJG9fFCgh4h_LvH-0eVguz4f1Hc3100CrAnESL0QaMvSdvpqXTOmnjDoH7Dth_mednSipSVdOAxHLcQYHcD66C278-sysHEd2kzJUVjS80fq7ynL_sY4G7qz2LWiGAm9FUGTy0AWzJ97_6-lhkzKsotoIEVzZ8ISBw1AJ3et20742UUEqFvP4f5aSMnL0kZLgPwJKggcwyTJMRp-DK7Kt75i_jVfWynCuX6dTuCslCaMyM1GSoIRo113fMi9Jx1_5xaHWmAo6wH387Di0cjpncB1O3Ye2kf-kpu4ZQnp_S5vfvf-x2cQ6fnoW47Wc5VgpSlygM8xkvl9QjJia2libzfqqladt851I1VlvmhUZqIX5waz0Ja-aqM2uXSvzX7QvIS6FJblrdfq3dMt86u0-ss-FMtzMpa8nk8gtUfh-p7JVJ6eMjSBzaS5gMyw4mvn7UU-JYV5Jveiffkexqfq1SnyOzQzXoh275OtwkuvwvUtXFo8c3QiBlh0mJQupWuM28xV6JfJRhniQfxeqpWImuq_RncBeMgY02tqviIFwqU0ffyfOb-i6YJ1g6ar4pqu49Vl8dUBBiXuaUcVXWsnx80IXcczS50X2UFOjYqoOUJIwOYimdI1xMkJ39eUz1u8nso4-cRIgthWBRsO2xpSIyayBOQegdBynz0OdI5RQ2_lwk7R-4QIY6nsVRUxJBUxeqdy4n06WltplvagzOVr72-RW8eUFfmy-ZjiSJ3IWsM8fh3m5ZWJirpfg4fhxJyxI6S2OSylMgnzl2lU6XOeMqsh8JRMaJBQvmz-3-xZWQqp1Q_iOapv7XyYvYchdqV3Ys5tB8ImbWzS-O-fUjgIRdI_g9opRRIFOhypaszr0a9__VdQJFQFx0rjgaR7jBSrd84gZ2w");


server.listen(process.env.PORT,()=>{
    console.log("Server is connected with",process.env.PORT);
    connectToMongo();
})