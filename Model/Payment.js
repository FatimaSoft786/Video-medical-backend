const mongoose = require("mongoose")
const paymentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId, "ref": "User"
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId, "ref": "User"
    },
    fee: {
        type: Number
    },
    admin_percentage_amount: {
        type: Number,
        default:0
    },
    doctor_percentage_amount: {
        type: Number,
        default:0
    },
    payment_status: {
        type: String,
        default: "Unpaid"
    },
    wallet_balance: {
        type: Number,
        default: 0
    }
},
{
    timestamps: true
});
module.exports = mongoose.model("Payment",paymentSchema);