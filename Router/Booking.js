const express = require("express");
const {registerBooking,getPatientBooking} = require("../Controller/Booking");
const router = express.Router();
router.post("/register",registerBooking);
router.post("/patientBookings/:id",getPatientBooking);


module.exports = router;