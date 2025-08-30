const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { SubscriptionTypeValidation } = require("../validations");
const { SubscriptionTypeController } = require("../controllers");

const router = express.Router();
router
  .route("/")
  .post(
    auth("admin"),
    validate(SubscriptionTypeValidation.addSubscriptionType),
    SubscriptionTypeController.createSubscriptionType
  )
  .get(SubscriptionTypeController.getSubscriptionTypes);
router
  .route("/:subscriptionTypeId")
  .get(
    validate(SubscriptionTypeValidation.getSubscriptionType),
    SubscriptionTypeController.getSubscriptionType
  )
  .put(
    validate(SubscriptionTypeValidation.updateSubscriptionType),
    SubscriptionTypeController.updateSubscriptionType
  )
  .delete(
    validate(SubscriptionTypeValidation.getSubscriptionType),
    SubscriptionTypeController.deleteSubscriptionType
  );

module.exports = router;
