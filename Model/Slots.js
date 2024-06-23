const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slotSchema = new Schema({
     time: {
    type: [String], // Array of times as strings
    required: true
  },
  date: {
    type: String, // Date object
    required: true
  },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visit: {
    type: Number
  },
  followUp: {
    type: Number
  },
  currency: {
    type: String
  }
});
module.exports = mongoose.model("Slot",slotSchema);