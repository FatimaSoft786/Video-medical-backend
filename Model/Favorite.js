const mongoose = require("mongoose")
const favoriteSchema = new mongoose.Schema({
 patient: {
         type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }

});
module.exports = mongoose.model("Favorite",favoriteSchema)