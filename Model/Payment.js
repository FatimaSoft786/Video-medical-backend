const mongoose = require("mongoose")
const paymentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        "ref": "Patient"
    },
    visit_fee: {
        type: String
    },
    service: {
        type: String
    },
    doctorId: {
        type: String
    }
},{
    timestamps: true
});
module.exports = mongoose.model("Payments",paymentSchema);