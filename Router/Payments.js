const express = require("express");
const {CheckoutSession,createPayment,getPayments,deletePayment,paymentDetails} = require("../Controller/Payments");
const router = express.Router();
router.post("/checkout",CheckoutSession);
router.post("/createPayments",createPayment);
router.get("/payments",getPayments);
router.get("/paymentDetails",paymentDetails);
router.delete("/deletePayment",deletePayment);

module.exports = router;