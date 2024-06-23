const express = require("express");
const { addReview, reviews, deleteReview,reviewByDoctorID} = require("../Controller/Reviews");
const router = express.Router();
var fetchUser = require("../middleware/fetchUser");
router.post("/addReview", fetchUser, addReview);
router.get("/reviews", fetchUser, reviews);
router.delete("/deleteReview/:id", fetchUser, deleteReview);
router.get("/doctorReviews",fetchUser,reviewByDoctorID)

module.exports = router;
