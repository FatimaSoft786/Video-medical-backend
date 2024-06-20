const mongoose = require("mongoose");
const specialistSchema = new mongoose.Schema({
    specialist: {
        type: String
    }
},{
    timestamps: true
});
module.exports = mongoose.model("Specialist",specialistSchema)


