const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { paymentValidation } = require("../validations");
const { paymentController, PayoutController } = require("../controllers");

const router = express.Router();
router
  .route("/add-payment-details/:userId")
  .post(auth("customer"), paymentController.addPaymentDetails);
router
  .route("/manage-payout")
  .post(auth("customer"), PayoutController.managePayoutDetails);
router.route("/withdraw").get(auth("customer"), paymentController.createPayout);
router
  .route("/payout/account-details")
  .get(auth("customer"), PayoutController.getPayoutMethod);
router
  .route("/payment-details")
  .get(auth("customer"), paymentController.getPaymentMethodDetails);

module.exports = router;
