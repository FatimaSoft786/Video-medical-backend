const express = require('express');
const { signup,login,fetchUserByID,verifyOtp,checkEmail,resetPassword,doctors,patients,doctorsAccounts,countData,fetchDoctorByID,approvalRequest,getTransactions,getAllReviews} = require('../Controller/Admin');
var fetchUser = require('../middleware/fetchUser');
const router = express.Router();
router.post('/signup', signup)
.post('/login', login)
.post("/total",fetchUser,countData)
.post('/checkEmail',checkEmail)
.post('/verifyOtp',verifyOtp)
.post('/resetPassword',resetPassword)
.post("/doctorsList",fetchUser,doctors)
.post("/patientsList",fetchUser,patients)
.post('/accountApproval/:id',fetchUser,doctorsAccounts)
.post("/fetchDoctorById",fetchUser,fetchDoctorByID)
.post("/accountApproval",fetchUser,approvalRequest)
.get("/transactionsList",fetchUser,getTransactions)
.get('/fetchDetails',fetchUser,fetchUserByID);



module.exports = router;
