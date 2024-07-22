const express = require('express');
const { signup,login,fetchUserByID,verifyOtp,checkEmail,resetPassword,doctors,patients,countData,fetchDoctorByID,approvalRequest,getTransactions} = require('../Controller/Admin');
var fetchUser = require('../middleware/fetchUser');
const router = express.Router();
router.post('/signup', signup)
.post('/login', login)
.post("/total",fetchUser,countData)
.post('/checkEmail',checkEmail)
.post('/verifyOtp',verifyOtp)
.post('/resetPassword',resetPassword)
.post("/patientsList",fetchUser,patients)
.post("/doctorsList",fetchUser,doctors)
.post("/fetchDoctorById",fetchUser,fetchDoctorByID)
.post("/accountApproval",fetchUser,approvalRequest)
.get("/transactionsList",fetchUser,getTransactions)
.get('/fetchDetails',fetchUser,fetchUserByID);



module.exports = router;
