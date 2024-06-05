const express = require('express');
const { signup,login, logout,fetchUserByID,verifyOtp,checkEmail,resetPassword,doctors,patients,doctorsAccounts,countData} = require('../Controller/Admin');
var fetchUser = require('../middleware/fetchUser');
const router = express.Router();
router.post('/signup', signup)
.post('/login', login)
.get("/total",fetchUser,countData)
.post('/checkEmail',checkEmail)
.post('/verifyOtp',verifyOtp)
.post('/resetPassword',resetPassword)
.get("/doctorsList",fetchUser,doctors)
.get("/patientsList",fetchUser,patients)
.post('/accountApproval/:id',fetchUser,doctorsAccounts)
.get('/fetchDetails',fetchUser,fetchUserByID);



module.exports = router;
