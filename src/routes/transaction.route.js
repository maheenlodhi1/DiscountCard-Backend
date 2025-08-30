const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { TransactionController } = require("../controllers");

const router = express.Router();
router
  .route("/partners/:partnerId")
  .get(auth("partner"), TransactionController.getTransactions);
router
  .route("/customers/:customerId")
  .get(auth("customer"), TransactionController.getTransactions);

router.route("/").get(TransactionController.getTransactions);

router.route("/:transactionId").get(TransactionController.getTransaction);

module.exports = router;
