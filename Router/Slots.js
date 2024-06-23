const express = require("express");
const {addSlots,getSlots} = require("../Controller/Slots");
const router = express.Router();
var fetchUser = require("../middleware/fetchUser");
router.post("/addSlots", fetchUser, addSlots);
router.get("/getSlots",getSlots);


module.exports = router;