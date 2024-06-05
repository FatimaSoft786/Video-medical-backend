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
  doctor_id: {
    type: String
  },
  session1: {
    type: String
  },
  session2: {
    type: String
  },
  session3:{
    type: String
  },
  session4: {
    type: String
  }
});

const reviewSchema = new Schema({
patientName: {
    type: String
},
doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
reviews: {
    type: String
},
rating: {
    type: Number
},
},{
    timestamps: true
});



const doctorSchema = new Schema({
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
        type: String,
        "default": "Doctor@12345"
    },
    phoneNo: {
        type: String
    },
    location: {
        type: String,
        default: ""
    },
    postalCode: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        default: ""
    },
    dob: {
        type: String,
        default: ""
    },
    studies_start_year: {
        type: String,
        default: ""
    },
    studies_end_year: {
        type: String,
        default: ""
    },
    special_recognition: {
        type: String,
        default: ""
    },
    specialist: {
        type: String
    },
    clinic_hospital_address: {
        type: String
    },
    signature_url: {
        type: String,
        default: ""
    },
     signature_public_id: {
    type: String,
    default: ""
    },
    about_info: {
        type: String,
        default: ""
    },
    account_approved: {
        type: Boolean,
        default: false
    },
    reason_account_declined: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        default: "Doctor"
    },
    otp: {
        type: String,
        default: ""
    },
    social_profile: {
        type: String,
        default: ""
    },
    profile_public_id: {
    type: String,
    default: ""
},
picture_url: {
    type: String,
    default: ""
},
default_picture_url: {
    type: String,
    default: "https://res.cloudinary.com/duhiildi0/image/upload/v1717492663/user_mse9as.png"
},
    slots: [slotSchema],
    reviews: [reviewSchema]
   
},{
    timestamps: true
});

module.exports = mongoose.model("Doctor",doctorSchema)


