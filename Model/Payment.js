const mongoose = require("mongoose")
const paymentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId, "ref": "Patient"
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId, "ref": "Doctor"
    },
    session_fee: {
        type: Number
    },
    admin_percentage_amount: {
        type: Number
    },
    doctor_percentage_amount: {
        type: Number
    },
    payment_status: {
        type: "String",
        default: "Unpaid"
    }
},
{
    timestamps: true
});
module.exports = mongoose.model("Payment",paymentSchema);