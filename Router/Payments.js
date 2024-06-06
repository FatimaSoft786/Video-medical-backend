const express = require("express");
const {CheckoutSession,createPayment,getPayments} = require("../Controller/Payments");
const router = express.Router();
router.post("/checkout",CheckoutSession);
router.post("/createPayments",createPayment);
router.get("/payments",getPayments);
module.exports = router;