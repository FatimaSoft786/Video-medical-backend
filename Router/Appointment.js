const express = require("express");
const {createAppointment,fetchAppointments,changeAppointmentStatus,cancelAppointment,fetchAppointmentByPatient} = require("../Controller/Appointments");
const router = express.Router();
router.post("/createAppointment",createAppointment);
router.get("/fetchAll",fetchAppointments);
router.post("/changeAppointmentStatus",changeAppointmentStatus);
router.post("/cancelAppointment/:id",cancelAppointment);
router.post("/fetchAppointmentByPatient",fetchAppointmentByPatient);




module.exports = router;