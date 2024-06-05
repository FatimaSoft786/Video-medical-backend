const express = require("express");
const {register,login,verifyOtp,checkEmail,resetPassword,likeDoctor,unlikeDoctor,uploadPatientData,deletePicture,uploadHistoryPicture,deleteHistoryPicture,likedDoctorByPatient,fetchProfile} = require("../Controller/Patient");
const router = express.Router();

var fetchUser = require('../middleware/fetchUser');

router.post("/signup",register);
router.post("/login",login);
router.post("/verifyOtp",verifyOtp);
router.post("/checkEmail",checkEmail);
router.post("/resetPassword",resetPassword);
router.post("/like",likeDoctor);
router.post("/unlike",unlikeDoctor);
router.post("/uploadData",uploadPatientData);
router.post("/uploadHistoryPicture",uploadHistoryPicture)
router.delete("/deletePicture",deletePicture);
router.delete("/deleteHistoryPicture", deleteHistoryPicture);
router.post("/likedDoctor",likedDoctorByPatient);
router.get("/getuser",fetchUser,fetchProfile);
module.exports = router;