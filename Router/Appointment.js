const express = require("express");
const {createAppointment,fetchAppointments,changeAppointment} = require("../Controller/Appointments");
const router = express.Router();
router.post("/createAppointment",createAppointment);
router.get("/fetchAll",fetchAppointments);
router.post("/appointmentStatus/:id",changeAppointment);



module.exports = router;