const express = require("express");
const {register,login,verifyUser,verifyOtp,checkEmail,resetPassword,editPatientProfile,uploadProfilePicture,deleteProfilePicture,fetchProfile,patientMedicalHistory,uploadSignaturePicture,getAllDoctors,postFavorite,getFavorites,removeFavorite,addReviews,addSlots,getSlots,doctorProfile,patientProfile,doctorDashboard, editDoctorProfile,addMeeting} = require("../Controller/User");
const router = express.Router();
 var fetchUser = require('../middleware/fetchUser');
router.post("/signup",register);
 router.post("/login",login);
 router.post("/verifyUser",verifyUser);
 router.post("/verifyOtp",verifyOtp);
 router.post("/checkEmail",checkEmail);
 router.post("/resetPassword",resetPassword);
 router.post("/editDoctorProfile",fetchUser,editDoctorProfile);
 router.post("/editPatientProfile",fetchUser,editPatientProfile)
 router.post("/uploadSignature",fetchUser,uploadSignaturePicture);
 router.post("/uploadProfilePicture",fetchUser,uploadProfilePicture);
 router.post("/deletePicture",deleteProfilePicture);
 router.post("/patientMedicalHistory",fetchUser,patientMedicalHistory);
 router.post("/userDetails",fetchUser,fetchProfile);
 router.post("/doctorsList",fetchUser,getAllDoctors);
 router.post("/like",fetchUser,postFavorite);
 router.post("/favoritesByPatient",fetchUser,getFavorites);
 router.delete("/deleteFavoriteByPatient",fetchUser,removeFavorite);
 router.post("/addReview",fetchUser,addReviews);
 router.post("/addSlots",fetchUser,addSlots);
 router.post("/getSlots",fetchUser,getSlots);
 router.post("/getDoctorProfile",fetchUser,doctorProfile);
 router.post("/getPatientProfile",fetchUser,patientProfile);
 router.post("/doctorDashboard",fetchUser,doctorDashboard);
 router.post("/addRoomId",addMeeting);

 
module.exports = router;