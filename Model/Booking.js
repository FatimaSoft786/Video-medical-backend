const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema({
    time: {
        type: String
    },
    session_fee: {
        type: Number
    },
    date: {
        type: String
    },
    patientId:{
        type: String
    },
     doctor_name: {
        type: String
     },
     doctor_location: {
        type: String
     },
     doctor_picture_url: {
        type: String
     },
     specialist:{
        type: String
     },
     doctorId: {
        type: String
     },
    payment_status: {
        type: String,
        default: "Unpaid"
    }
},{
    timestamps: true
});
module.exports = mongoose.model("Bookings",bookingSchema);