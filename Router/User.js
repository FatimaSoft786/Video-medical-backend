const express = require("express");
const {register,login,verifyUser,verifyOtp,checkEmail,resetPassword,editPatientProfile,uploadProfilePicture,deleteProfilePicture,fetchProfile} = require("../Controller/User");
const router = express.Router();

 var fetchUser = require('../middleware/fetchUser');

router.post("/signup",register);
 router.post("/login",login);
 router.post("/verifyUser",verifyUser);
 router.post("/verifyOtp",verifyOtp);
 router.post("/checkEmail",checkEmail);
 router.post("/resetPassword",resetPassword);
 router.post("/editPatientProfile",fetchUser,editPatientProfile)
// router.post("/like",fetchUser,likeDoctor);
// router.post("/unlike",fetchUser,unlikeDoctor);
 router.post("/uploadProfilePicture",fetchUser,uploadProfilePicture);
 router.delete("/deletePicture",fetchUser,deleteProfilePicture);
// router.post("/likedDoctor",fetchUser,likedDoctorByPatient);
 router.get("/userDetails",fetchUser,fetchProfile);
module.exports = router;