const mongoose = require("mongoose");
const appointmentSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Doctor'
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Patient'
    },
    appointment_date: {
        type: String
    },
    appointment_time: {
   type: String
    },
    appointment_status:{
        type: String,
    },
    reason_for_cancel: {
        type: String
    },
    session_fee:{
        type: Number
    },
    earning: {
        type: Number
    },
    appointment_status: {
        type: String,
        default: "waiting"
    },
    payment_status: {
        type: String,
        default: "Unpaid"
    },
},{
    timestamps: true
});
module.exports = mongoose.model("Appointment",appointmentSchema);