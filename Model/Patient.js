const mongoose = require("mongoose");
const patientSchema = new mongoose.Schema({
firstName: {
    type: String
},
lastName: {
    type: String
},
email: {
    type: String
},
password: {
    type: String
},
phoneNumber:{
    type: Number
},
otp: {
    type: String,
    default: ""
},
role: {
    type: String,
    default: ""
},
pic_public_id: {
    type: String,
    default: ""
},
picture_url: {
    type: String,
    default: "https://res.cloudinary.com/duhiildi0/image/upload/v1717492663/user_mse9as.png"
},
dob: {
    type: String,
    default:""
},
location: {
    type: String,
    default: ""
},
postal_code: {
    type: String,
    default: ""
},
sex: {
    type: String,
    default: ""
},
history_doc_url: {
    type: String,

},
history_public_id: {
    type: String,
    default: ""
},
account_verified: {
    type: Boolean,
    default: false
},
good_health:{
    type: String
},
serious_illness: {
    type: String
},
serious_illness_description: {
    type: String
},
past_surgery: {
    type: String
},
past_surgery_description:{
    type: String
},
current_medication: {
    type: String
},
current_medication_description: {
    type: String
},
heart_disease: {
    type: String
},
blood_pressure: {
    type: String
},
allergies: {
    type: String
},
allergies_description: {
    type: String
},
diabetes: {
    type: String
},
kidney_disease: {
    type: String
},
thyroid: {
    type: String
},
stomach_disease: {
    type: String
},
digestive_disease: {
    type: String
},
digestive_description: {
    type: String
},
lung_disease:{
    type: String
},
lungs_description: {
    type: String
},
venereal: {
    type: String

},
nervous: {
    type: String
},
hormone: {
    type: String
},
any_illness: {
    type: String
},
any_illness_description: {
    type: String
},
smoke: {
    type: String
},
alcohol: {
    type: String
},
aids: {
    type: String
},
usual_medicine: {
    type: String
},
usual_medicine_description: {
    type: String
},
favorite: [
   {
    type: mongoose.Schema.Types.ObjectId,ref: "Doctor"
   }
],
},{
    timestamps: true
});

module.exports = mongoose.model("Patient",patientSchema)