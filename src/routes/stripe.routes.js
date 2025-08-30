const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { paymentController } = require("../controllers");
const { StripeServices } = require("../services");

const router = express.Router();

router.route("/").get(auth("customer"), paymentController.addPaymentDetails);
router.route("/webhook").post(StripeServices.webhook);
module.exports = router;
