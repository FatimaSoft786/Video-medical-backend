const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//review schema
const reviewSchema = new Schema({
patient: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
review: {
    type: String
},
rating: {
    type: Number
},
},{
    timestamps: true
});

module.exports = mongoose.model("Review",reviewSchema);