const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { ReviewValidation } = require("../validations");
const { ReviewController } = require("../controllers");

const router = express.Router();
router
  .route("/")
  .post(
    auth("customer"),
    validate(ReviewValidation.feedback),
    ReviewController.createReview
  );

router
  .route("/customers/:customerId")
  .get(
    auth("customer"),
    validate(ReviewValidation.getCustomerReviews),
    ReviewController.getCustomerReviews
  );

module.exports = router;
