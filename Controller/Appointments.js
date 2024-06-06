const Appointment = require("../Model/Appointments")
const Doctor = require("../Model/Doctor");
const Patient = require("../Model/Patient");
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

const fetchAppointments = async(req,res)=>{
  try {
    const appointments = await Appointment.find().populate('doctor', '_id firstName lastName picture_url').populate('patient', '_id firstName lastName picture_url');
    res.json({success: true, appointments: appointments}); 
  } catch (error) {
    console.log(error.message);
    return res.json({success: false, message: "Internal server error"});
  }
}

const changeAppointment = async(req,res)=>{
     const {id} = req.params;
    try {
     const data = await Appointment.findByIdAndUpdate(id, req.body, { new: true });
       res.json({success:true,message: "Your appointment status has been updated."});
    } catch (error) {
        console.log(error.message);
        return res.json({success: false, message: error.message});
    }
}


module.exports = {
    createAppointment,
    fetchAppointments,
    changeAppointment
}