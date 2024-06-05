const Booking = require("../Model/Booking");
const Doctor = require("../Model/Doctor");


const registerBooking = async(req,res)=>{
    try {

        const doc = await Doctor.findOne({_id: req.body.doctorId});
       
        
      check = await Booking.create({
                time: req.body.time,
                date: req.body.date,
                session_fee: req.body.session_fee,
                patientId: req.body.patientId,
                doctorId: req.body.doctorId,
                "doctor_name": doc.firstName + doc.lastName,
                "doctor_location": doc.location,
                "doctor_picture_url": "",
                "specialist": doc.specialist              
            });
            res.status(200).json({error: false,message: check})
    } catch (error) {
        res.status(500).json({error: true,message: error.message});
    }
};

const getPatientBooking = async(req,res)=>{
    try {
        
const slot = await Booking.find({patientId: req.params.id});
if(!slot){
        return res.status(400).json({error: true,message: "Booking not found"})
     }else{
        res.status(200).json({error:false, appointment: slot})
     }
        
    } catch (error) {
        res.status(500).json({error: true,message: error.message});
    }
};

module.exports = {
    registerBooking,
    getPatientBooking
    
}