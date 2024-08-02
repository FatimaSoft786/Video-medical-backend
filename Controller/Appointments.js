const Appointment = require("../Model/Appointments")
const User = require("../Model/User")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const nodemailer = require("nodemailer");
const moment = require('moment');

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
//Book appointment
const BookAppointment = async (req, res) => { 
  try {
  //   const appointment = await Appointment.findOne({doctor: req.body.doctorId});
  //   if(appointment.appointment_status === 'waiting'){
  //     return res.json({success: false, message: "Your already have appointment with this doctor"});
  //  }
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: req.body.items.map((item) => {
          return {
            price_data: {
              currency: "eur",
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
            "patient": req.body.patientId,
            "doctor": req.body.doctorId,
            "fee": req.body.fee,
            "appointment_date": req.body.appointment_date,
            "appointment_time": req.body.appointment_time
          }
        },
        success_url: "https://video-medical-master.vercel.app/it/patient/appointments/success",
        cancel_url: "https://video-medical-master.vercel.app/it/patient/appointments/failed"
      });
      res.status(200).json({url: session.url})
  } catch (error) {
    console.log(error.message);
    res.json({success: false, message: "Internal server error"})
  }
};
//create Appointment
const createAppointment = async(req,res)=>{
    try {

    data = await Appointment.create({
        doctor: req.body.doctorId,
        patient: req.body.patientId,
        appointment_date: req.body.appointment_date,
        session_fee: req.body.session_fee,
        appointment_time: req.body.appointment_time
    });
  
            res.json({success:true,message: data})
    } catch (error) {
    console.log(error.message);
       return res.json({success: false,message: 'Internal server error'});
    }
};
//fetch all appointments
const fetchAppointments = async(req,res)=>{
  try {
    const appointments = await Appointment.find().populate('doctor', '_id firstName lastName default_picture_url specialist meeting').populate('patient', '_id firstName lastName picture_url default_picture_url');
    res.json({success: true, appointments: appointments}); 
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}
//change appointment status
const changeAppointmentStatus = async(req,res)=>{
    try {
      const {appointment_status,appointmentId} = req.body;
   const appointment = await Appointment.findOne({_id: appointmentId});
   if(appointment_status === "completed" ){
    const admin_amount  = appointment.fee * 0.25;
     const doctor_amount = appointment.fee - admin_amount;
     
     const data = await Appointment.findByIdAndUpdate(
            {_id: req.body.appointmentId},
            {$set: {doctor_percentage_amount: doctor_amount,appointment_status: 'completed',admin_percentage_amount: admin_amount}},
            {new: true});
            res.json({success: true, message: "Congratulations!! your payment has been transferred in your account"})
   }else{
     const data = await Appointment.findByIdAndUpdate(
            {_id: appointmentId},
            {$set: {appointment_status:'waiting'}},
            {new: true});
    res.json({success: true, message: "Appointment is incomplete"})
   }

    } catch (error) {
        console.log(error.message);
        return res.json({success: false, message: error.message});
    }
}
//cancel appointment
const cancelAppointment = async(req,res)=>{
  const appointmentId = req.body.appointmentId;
   try {
const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.json({success: false, message: 'Appointment not found' });
        }

        const now = new Date();
        const timeDifference = (appointment.date - now) / (1000 * 60 * 60); // Difference in hours
        console.log(timeDifference);

        if (timeDifference > 48) {
            return res.json({success: false, message: 'Cannot cancel an appointment less than 48 hours before the scheduled time' });
        }else{
           const data = await Appointment.findByIdAndUpdate(
            {_id: appointmentId},
            {$set: {appointment_status: 'cancelled'}},
            {new: true});

            const user = await User.findById({_id: appointment.patient})

             let mailOption = {
                from: process.env.SMTP_MAIL,
                to: user.email,
                subject: "Televisita Cancellata",
               text: `Gentile,${user.firstName}${user.lastName}${process.env.CANCELLED_APPOINTMENT}`
            };
            transporter.sendMail(mailOption,function(error){
          if(error){
          return  res.json({success:false, message: error})
          }else{
           console.log("email sent");
          }
            }); 
        
        res.json({success: true, message: 'Appointment cancelled successfully',data });
        }

       


    
   } catch (error) {
    console.log(error.message)
    return res.json({success: false, message: error.message});
   }
}
// fetch appointment by patient
const fetchAppointmentByPatient = async(req,res)=>{
  try {

    const data = await Appointment.find({patient: req.body.patient}).populate('doctor', '_id firstName lastName picture_url default_picture_url specialist total_reviews average_rating favorites location meeting').populate('patient', '_id firstName lastName picture_url');
    if(!data){
      return res.json({success: false, message: "Data not found"})
    }else{
    // const appointments = await Appointment.find()
    res.json({success: true, appointments: data}); 
    }

   
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}
// fetch appointments by doctorId
const fetchAppointmentByDoctor = async(req,res)=>{
  try {
    const data = await Appointment.find({doctor: req.body.doctor});
    if(!data){
      return res.json({success: false, message: "Data not found"})
    }else{
     const appointments = await Appointment.find().populate('patient', '_id firstName lastName picture_url default_picture_url postal_code sex dob location phoneNumber good_health serious_illness serious_illness_description past_surgery past_surgery_description current_medication current_medication_description heart_disease blood_pressure  allergies allergies_description diabetes kidney_disease thyroid stomach_disease  digestive_disease  digestive_description lung_disease lungs_description venereal nervous hormone any_illness any_illness_description smoke alcohol aids usual_medicine usual_medicine_description');
    
      const adminAmountsDict = {};
    appointments.forEach(appointment => {
    adminAmountsDict[appointment._id] = appointment.doctor_percentage_amount || 0;
  });
  let totalDoctorAmount = 0;
  appointments.forEach(appointment => {
    const adminAmount = adminAmountsDict[appointment._id] || 0;
    totalDoctorAmount += adminAmount;
  });
  res.json({success: true, total_earning: totalDoctorAmount,total_appointments: appointments.length,total_patients: appointments.length,appointments_list: appointments}); 
    }

   
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}
//view patient profile By doctor
const fetchPatientProfile = async(req,res)=>{
   try {
    const user = await User.findOne({_id: req.body.patientId}).select("-password")
    res.json({success: true, user_details: user })
  } catch (error) {
    console.error(error.message);
  return  res.json({success: false, message:"Internal Server Error"});
  }

};
//Upcoming appointments
const upcomingAppointments = async(req,res)=>{
  try {
 
    const appointments = await Appointment.find({doctor: req.body.doctorId});
    if(!appointments){
      return res.json({success: false, message: "No appointments found"})
    }else{
 const today = moment().startOf('day').format('DD MMMM YYYY');
    // const todayDate = moment(today, 'DD MMMM YYYY').toDate();
    // console.log(todayDate);
    const upcomingAppointments = await appointments.find({
      appointment_date: { $gte: today }
    });
    res.json({success: true, message: upcomingAppointments});
    }

  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}
// approval request for the appointment
const approvalRequest = async(req,res)=>{
  try {
     const {appointmentId,status} = req.body;
         const appointment = await Appointment.findOne({_id: appointmentId}).populate('patient','_id firstName email lastName picture_url postal_code sex dob location phoneNumber good_health serious_illness serious_illness_description past_surgery past_surgery_description current_medication current_medication_description heart_disease blood_pressure  allergies allergies_description diabetes kidney_disease thyroid stomach_disease  digestive_disease  digestive_description lung_disease lungs_description venereal nervous hormone any_illness any_illness_description smoke alcohol aids usual_medicine usual_medicine_description');
    if(status === true){
      const appointmentData = await Appointment.findByIdAndUpdate(
      { _id: appointment._id },
      { $set: { appointment_request_approved: true } },
      { new: true }
    );
  
    let mailOption = {
                from: process.env.SMTP_MAIL,
                to: appointment.patient.email,
                subject: "Appointment accepted",
                text: `Congratulations!! this is the official email your appointment have been accepted by the doctor.`
            };
            transporter.sendMail(mailOption,function(error){
          if(error){
            return res.json({success: true, message: error})
          }else{
           res.json({success: true, message: "Email sent to the patient email"})
          }
            });   
    }else{
 const appointmentData = await User.findByIdAndUpdate(
      { _id: appointment._id },
      { $set: { appointment_request_declined: true } },
      { new: true }
    );
  
    let mailOption = {
                from: process.env.SMTP_MAIL,
                to: appointment.patient.email,
                subject: "Appointment Cancelled",
                text: process.env.CANCELLED_APPOINTMENT
            };
            transporter.sendMail(mailOption,function(error){
          if(error){
            return res.json({success: true, message: error})
          }else{
           res.json({success: true, message: "Email sent to the doctor email"})
          }
            }); 
    }
    
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}
// fetch notification by patient
const fetchNotificationsByPatient = async(req,res)=>{
  try {

    const data = await Appointment.find({appointment_date: req.body.date}).populate('doctor', '_id firstName lastName picture_url default_picture_url specialist total_reviews average_rating favorites location').populate('patient', '_id firstName lastName picture_url default_picture_url');
    if(!data){
      return res.json({success: false, message: "Data not found"})
    }else{
    // const appointments = await Appointment.find()
    res.json({success: true, notifications: data}); 
    }

   
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}



module.exports = {
    createAppointment,
    fetchAppointments,
    changeAppointmentStatus,
    cancelAppointment,
    fetchAppointmentByPatient,
    fetchAppointmentByDoctor,
    fetchPatientProfile,
    BookAppointment,
    approvalRequest,
    upcomingAppointments,
    fetchNotificationsByPatient
}