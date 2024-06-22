const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    phoneNumber: {
      type: Number,
    },
    otp: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "",
    },
    pic_public_id: {
      type: String,
    },
    picture_url: {
      type: String,
    },
    default_picture_url: {
      type: String,
      default:
        "https://res.cloudinary.com/duhiildi0/image/upload/v1717492663/user_mse9as.png",
    },
    dob: {
      type: String,
    },
    location: {
      type: String,
    },
    postal_code: {
      type: String,
    },
    sex: {
      type: String,
      default: "",
    },
    account_approved: {
      type: Boolean,
      default: false,
    },
    studies_start_year: {
      type: String,
    },
    studies_end_year: {
      type: String,
    },
    special_recognition: {
      type: String,
    },
    specialist: {
      type: String,
    },
    clinic_hospital_address: {
      type: String,
    },
    signature_url: {
      type: String,
    },
    signature_public_id: {
      type: String,
    },
    about: {
      type: String,
    },
    reason_account_declined: {
      type: String,
    },
    doctor_cv_url: {
      type: String,
    },
    cv_public_id: {
      type: String,
    },
    good_health: {
      type: String,
    },
    serious_illness: {
      type: String,
    },
    serious_illness_description: {
      type: String,
    },
    past_surgery: {
      type: String,
    },
    past_surgery_description: {
      type: String,
    },
    current_medication: {
      type: String,
    },
    current_medication_description: {
      type: String,
    },
    heart_disease: {
      type: String,
    },
    blood_pressure: {
      type: String,
    },
    allergies: {
      type: String,
    },
    allergies_description: {
      type: String,
    },
    diabetes: {
      type: String,
    },
    kidney_disease: {
      type: String,
    },
    thyroid: {
      type: String,
    },
    stomach_disease: {
      type: String,
    },
    digestive_disease: {
      type: String,
    },
    digestive_description: {
      type: String,
    },
    lung_disease: {
      type: String,
    },
    lungs_description: {
      type: String,
    },
    venereal: {
      type: String,
    },
    nervous: {
      type: String,
    },
    hormone: {
      type: String,
    },
    any_illness: {
      type: String,
    },
    any_illness_description: {
      type: String,
    },
    smoke: {
      type: String,
    },
    alcohol: {
      type: String,
    },
    aids: {
      type: String,
    },
    usual_medicine: {
      type: String,
    },
    usual_medicine_description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
