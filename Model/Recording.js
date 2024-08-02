const mongoose = require("mongoose")
const recordingSchema = new mongoose.Schema({
    recording: {
        type: String
    },
    recordDate:{
        type: String
    }
},
{
    timestamps: true
});
module.exports = mongoose.model("Recordings",recordingSchema);