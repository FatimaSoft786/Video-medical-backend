const express = require("express");
const {fetchAppointments,changeAppointmentStatus,cancelAppointment,fetchAppointmentByPatient,fetchAppointmentByDoctor,fetchPatientProfile,BookAppointment,approvalRequest,upcomingAppointments,fetchNotificationsByPatient} = require("../Controller/Appointments");
const router = express.Router();
var fetchUser = require("../middleware/fetchUser");
router.get("/fetchAll",fetchAppointments);
router.post("/changeAppointmentStatus",fetchUser,changeAppointmentStatus);
router.post("/cancelAppointment",fetchUser,cancelAppointment);
router.post("/fetchAppointmentByPatient",fetchUser,fetchAppointmentByPatient);
router.post("/fetchAppointmentByDoctor",fetchUser,fetchAppointmentByDoctor)
router.get("/viewPatientProfile",fetchUser,fetchPatientProfile);
router.post("/BookAppointment",fetchUser,BookAppointment);
router.post("/ApprovalAppointmentRequest",fetchUser,approvalRequest);
router.post("/upcomingAppointments",fetchUser,upcomingAppointments);
router.post("/patientNotifications",fetchUser,fetchNotificationsByPatient);


module.exports = router;