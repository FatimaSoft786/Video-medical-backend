const express = require("express");
const {CheckoutSession} = require("../Controller/Payments");
const router = express.Router();
router.post("/checkout",CheckoutSession);
module.exports = router;