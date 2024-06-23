const express = require("express");
const {register,login,verifyUser,verifyOtp,checkEmail,resetPassword,editPatientProfile,uploadProfilePicture,deleteProfilePicture,fetchProfile,patientMedicalHistory,uploadSignaturePicture} = require("../Controller/User");
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

 
module.exports = router;