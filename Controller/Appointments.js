const Appointment = require("../Model/Appointments")
const Doctor = require("../Model/Doctor");
const Patient = require("../Model/Patient");

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
    const appointments = await Appointment.find().populate('doctor', '_id firstName lastName default_picture_url specialist').populate('patient', '_id firstName lastName picture_url');
    res.json({success: true, appointments: appointments}); 
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}
//change appointment status
const changeAppointmentStatus = async(req,res)=>{
    try {
   const appointment = await Appointment.findOne({_id: req.body.appointmentId});
   if(appointment.appointment_status === 'waiting'){
    const admin_amount  = appointment.session_fee * 0.25;
     const doctor_amount = appointment.session_fee - admin_amount;
     
     const data = await Appointment.findByIdAndUpdate(
            {_id: req.body.appointmentId},
            {$set: {doctor_percentage_amount: doctor_amount,appointment_status: 'completed'}},
            {new: true});
            res.json({success: true, message: "Congratulations!! your payment has been transferred in your account"})
   }

    } catch (error) {
        console.log(error.message);
        return res.json({success: false, message: "Internal server error"});
    }
}
//cancel appointment
const cancelAppointment = async(req,res)=>{
  const appointmentId = req.params.id;
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
        await Appointment.findByIdAndDelete(appointmentId);
        res.json({success: true, message: 'Appointment cancelled successfully' });
        }

       


    
   } catch (error) {
    console.log(error.message)
    return res.json({success: false, message: error.message});
   }
}
// fetch appointment by patient
const fetchAppointmentByPatient = async(req,res)=>{
  try {

    const data = await Appointment.find({patient: req.body.patient});
    if(!data){
      return res.json({success: false, message: "Data not found"})
    }else{
     const appointments = await Appointment.find().populate('doctor', '_id firstName lastName picture_url').populate('patient', '_id firstName lastName picture_url');
    res.json({success: true, appointments: appointments}); 
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
   
}