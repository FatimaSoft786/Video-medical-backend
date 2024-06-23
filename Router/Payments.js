const express = require("express");
const {CheckoutSession,createPayment,getPayments,deletePayment,paymentDetails} = require("../Controller/Payments");
const router = express.Router();
 var fetchUser = require('../middleware/fetchUser');
router.post("/checkout",CheckoutSession);
router.post("/createPayments",fetchUser,createPayment);
router.get("/payments",fetchUser,getPayments);
router.get("/paymentDetails",paymentDetails);
router.delete("/deletePayment",deletePayment);

module.exports = router;