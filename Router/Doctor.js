const express = require("express");
const {register,login,verifyOtp,fetchUserByID,availability,sessions,checkEmail,resetPassword,uploadProfilePicture,deleteProfilePicture,addReview,deleteReview,deleteDoctor,fetchAppointmentByDoctor} = require("../Controller/Doctor");
var fetchUser = require('../middleware/fetchUser');
const router = express.Router();
router.post("/signup",register);
router.post("/login",login)
router.post("/verifyOtp",verifyOtp);
router.post("/checkEmail",checkEmail);
router.post('/resetPassword',resetPassword);
router.get("/getUser",fetchUser,fetchUserByID);
router.post("/uploadProfilePicture",fetchUser,uploadProfilePicture);
router.delete('/deleteProfilePicture',fetchUser,deleteProfilePicture);
router.post("/addslots",fetchUser,availability);
router.post("/addReview",addReview);
router.delete('/deleteReview/:id',deleteReview);
router.delete('/deleteDoctor',deleteDoctor);
router.post("/fetchAppointmentByDoctor",fetchAppointmentByDoctor);



module.exports = router;