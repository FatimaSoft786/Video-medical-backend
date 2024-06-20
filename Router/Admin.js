const express = require('express');
const { signup,login,fetchUserByID,verifyOtp,checkEmail,resetPassword,doctors,patients,doctorsAccounts,countData} = require('../Controller/Admin');
var fetchUser = require('../middleware/fetchUser');
const router = express.Router();
router.post('/signup', signup)
.post('/login', login)
.get("/total",countData)
.post('/checkEmail',checkEmail)
.post('/verifyOtp',verifyOtp)
.post('/resetPassword',resetPassword)
.get("/doctorsList",doctors)
.get("/patientsList",patients)
.post('/accountApproval/:id',doctorsAccounts)
.get('/fetchDetails',fetchUserByID);



module.exports = router;
