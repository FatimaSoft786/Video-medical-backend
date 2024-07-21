const express = require("express");
const {uploadRecording,fetchRecordings} = require("../Controller/Recording");
const router = express.Router();
router.post("/uploadRecording",uploadRecording);
router.get("/all",fetchRecordings)


module.exports = router;