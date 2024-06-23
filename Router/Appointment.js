const express = require("express");
const {createAppointment,fetchAppointments,changeAppointmentStatus,cancelAppointment,fetchAppointmentByPatient,fetchAppointmentByDoctor,fetchPatientProfile} = require("../Controller/Appointments");
const router = express.Router();
var fetchUser = require("../middleware/fetchUser");
router.post("/createAppointment",fetchUser,createAppointment);
router.get("/fetchAll",fetchAppointments);
router.post("/changeAppointmentStatus",changeAppointmentStatus);
router.post("/cancelAppointment/:id",cancelAppointment);
router.post("/fetchAppointmentByPatient",fetchAppointmentByPatient);
router.post("/fetchAppointmentByDoctor",fetchAppointmentByDoctor)
router.get("/viewPatientProfile",fetchUser,fetchPatientProfile);




module.exports = router;