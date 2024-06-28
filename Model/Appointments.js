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
    appointment_request_approved: {
        type: Boolean,
        default: false
    },
    appointment_request_declined: {
        type: Boolean,
        default: false
    },
    fee:{
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
        default: "Unpaid"
    },
    date: {
        type: Date,
        default: Date.now
    },
    onGoingCall: {
        type: String,
        default: false
    },
    notified: { type: Boolean, default: false }
});
module.exports = mongoose.model("Appointment",appointmentSchema);