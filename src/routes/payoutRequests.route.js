const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {} = require("../validations");
const { PayoutRequestsController } = require("../controllers");

const router = express.Router();
router
  .route("/")
  .get(
    auth("customer", "admin"),
    PayoutRequestsController.getCustomerPayoutRequests
  );

router
  .route("/:payoutRequestId")
  .get(auth("admin"), PayoutRequestsController.getPayoutRequest)
  .put(auth("admin"), PayoutRequestsController.updatePayoutRequest);

module.exports = router;
