const express = require("express");
const {register,login,verifyOtp,fetchUserByID,availability,sessions,checkEmail,resetPassword,uploadProfilePicture,deleteProfilePicture,addReview,deleteReview,deleteDoctor} = require("../Controller/Doctor");
const {service} = require("../Controller/Service")
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
router.post("/register",service);
router.post("/addslots",fetchUser,availability);
router.post("/addReview",addReview);
router.delete('/deleteReview/:id',deleteReview);
router.delete('/deleteDoctor',deleteDoctor);


module.exports = router;