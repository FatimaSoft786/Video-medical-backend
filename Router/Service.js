const express = require("express");
const {service,getServices,fetchDoctors,fetchAllDoctors} = require("../Controller/Service")
const router = express.Router();

router.post("/register",service);
router.get("/fetch",getServices);
router.post("/findDoctor",fetchDoctors);
router.get("/fetchAll",fetchAllDoctors);


module.exports = router;