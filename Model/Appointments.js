const mongoose = require("mongoose");
const appointmentSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    appointment_date: {
        type: String
    },
    appointment_time: {
   type: String
    },
    reason_for_cancel: {
        type: String
    },
    session_fee:{
        type: Number
    },
    doctor_percentage_amount: {
        type: Number,
        default:0
    },
    appointment_status: {
        type: String,
        default: "waiting"
    },
    payment_status: {
        type: String,
        default: "Paid"
    },
    date: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model("Appointment",appointmentSchema);