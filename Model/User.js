const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
   patientId: {
         type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }
},{
  timestamps: true
});
const reviewSchema = new Schema({
patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
review: {
    type: String
},
rating: {
    type: Number
},
},{
    timestamps: true
});
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
});

const userSchema = new Schema(
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
      default: ""
    },
    picture_url: {
      type: String,
      default: ""
    },
    default_picture_url: {
      type: String,
      default:
        "https://res.cloudinary.com/duhiildi0/image/upload/v1717492663/user_mse9as.png",
    },
    dob: {
      type: String,
      default: ""
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
      default: "",
    },
    account_approved: {
      type: Boolean,
      default: false,
    },
    account_declined: {
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
      default: ""
    },
    signature_public_id: {
      type: String,
      default: ""
    },
    about: {
      type: String,
      default: ""
    },
    doctor_cv_url: {
      type: String,
      default: ""
    },
    cv_public_id: {
      type: String,
      default: ""
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
    visit: {
        type: Number,
        default: 0
    },
    followUp: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: "$"
    },
    education: {
        type: String,
        default: ""
    },
    university: {
      type: String,
      default: ""
    },
    experience:{
      type: String,
      default: ""
    },
    paymentId: {
      type: {type: mongoose.Schema.Types.ObjectId, ref: 'Payment'}
    },
    favorites: [favoriteSchema],
    reviews: [reviewSchema],
    slots: [slotSchema],
    total_reviews:{
      type: Number,
      default:0
    },
    average_rating: {
      type: Number,
      default: 0
    },
    meeting:{
    type: String
    },
    device_token: {
      type: String,
      default:""
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
