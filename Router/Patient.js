const express = require("express");
const {register,login,verifyPatient,checkEmail,resetPassword,likeDoctor,unlikeDoctor,uploadPatientData,deletePicture,uploadHistoryPicture,deleteHistoryPicture,likedDoctorByPatient,fetchProfile,verifyOtp} = require("../Controller/Patient");
const router = express.Router();

var fetchUser = require('../middleware/fetchUser');

router.post("/signup",register);
router.post("/login",login);
router.post("/verifyOtp",verifyOtp);
router.post("/verifyPatient",verifyPatient);
router.post("/checkEmail",checkEmail);
router.post("/resetPassword",resetPassword);
router.post("/like",fetchUser,likeDoctor);
router.post("/unlike",fetchUser,unlikeDoctor);
router.post("/editProfile",fetchUser,uploadPatientData);
router.post("/uploadHistoryPicture",fetchUser,uploadHistoryPicture)
router.delete("/deletePicture",fetchUser,deletePicture);
router.delete("/deleteHistoryPicture",fetchUser,deleteHistoryPicture);
router.post("/likedDoctor",fetchUser,likedDoctorByPatient);
router.get("/getuser",fetchUser,fetchProfile);
module.exports = router;