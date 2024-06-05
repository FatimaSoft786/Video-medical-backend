const mongoose = require("mongoose")
const favoriteSchema = new mongoose.Schema({
 patientId: {
         type: String
    },
    doctorId: {
       type: String
    },
    liked: {
        type: Boolean,
        default: false
    }

});
module.exports = mongoose.model("Favorite",favoriteSchema)