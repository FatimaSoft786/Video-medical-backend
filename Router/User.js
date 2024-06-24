const express = require("express");
const {register,login,verifyUser,verifyOtp,checkEmail,resetPassword,editPatientProfile,uploadProfilePicture,deleteProfilePicture,fetchProfile,patientMedicalHistory,uploadSignaturePicture,getAllDoctors,postFavorite,getFavorites,removeFavorite,addReviews,addSlots,getSlots,doctorProfile} = require("../Controller/User");
const router = express.Router();
 var fetchUser = require('../middleware/fetchUser');
router.post("/signup",register);
 router.post("/login",login);
 router.post("/verifyUser",verifyUser);
 router.post("/verifyOtp",verifyOtp);
 router.post("/checkEmail",checkEmail);
 router.post("/resetPassword",resetPassword);
 router.post("/editPatientProfile",fetchUser,editPatientProfile)
 router.post("/uploadSignature",fetchUser,uploadSignaturePicture);
 router.post("/uploadProfilePicture",fetchUser,uploadProfilePicture);
 router.delete("/deletePicture",fetchUser,deleteProfilePicture);
 router.post("/patientMedicalHistory",fetchUser,patientMedicalHistory);
 router.get("/userDetails",fetchUser,fetchProfile);
 router.get("/doctorsList",fetchUser,getAllDoctors);
 router.post("/like",fetchUser,postFavorite);
 router.get("/favoritesByPatient",fetchUser,getFavorites);
 router.delete("/deleteFavoriteByPatient",fetchUser,removeFavorite);
 router.post("/addReview",fetchUser,addReviews);
 router.post("/addSlots",fetchUser,addSlots);
 router.get("/getSlots",fetchUser,getSlots);
 router.get("/getDoctorProfile",fetchUser,doctorProfile);

 
module.exports = router;