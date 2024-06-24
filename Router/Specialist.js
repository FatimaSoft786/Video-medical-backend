const express = require("express");
const {addSpecialist,getSpecialists,fetchDoctors,fetchAllDoctors} = require("../Controller/Specialist")
const router = express.Router();
var fetchUser = require('../middleware/fetchUser');
router.post("/addSpecialist",addSpecialist);
router.get("/fetchSpecialists",fetchUser,getSpecialists);
router.post("/findDoctor",fetchDoctors);
router.get("/fetchAll",fetchAllDoctors);


module.exports = router;