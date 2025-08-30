const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { SubscriptionController } = require("../controllers");
const { SubscriptionsValidation } = require("../validations");

const router = express.Router();

router
  .route("/buy-subscription")
  .get(
    auth("customer", "partner"),
    validate(SubscriptionsValidation.buySubscription),
    SubscriptionController.buySubscription
  );

router
  .route("/create-invoice")
  .post(
    auth("admin"),
    validate(SubscriptionsValidation.createInvoice),
    SubscriptionController.createSubscriptionInvoice
  );
router
  .route("/membership")
  .get(auth("customer"), SubscriptionController.rotateMembership);

router
  .route("/check-subscription/:id")
  .get(auth("partner"), SubscriptionController.checkMembershipDetails);

module.exports = router;
