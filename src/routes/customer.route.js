const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { CustomerValidations } = require("../validations");
const { customerController } = require("../controllers");

const router = express.Router();

router
  .route("/dashboard")
  .get(auth("customer"), customerController.getDashboardStats);

router
  .route("/verify-referral/:referralId")
  .get(customerController.verifyReferral);

router
  .route("/update-payment-details/:customerId")
  .put(
    auth("customer"),
    validate(CustomerValidations.updatePaymentDetails),
    customerController.updatePaymentDetails
  );

// router.route("/wallet/:customerId").get(customerController.getCustomerWallet);

router
  .route("/")
  .get(auth("customer", "admin"), customerController.getCustomers)
  .post(
    auth("customer", "admin"),
    validate(CustomerValidations.createCustomer),
    customerController.createCustomer
  );
router
  .route("/:customerId")
  .get(
    auth("customer", "admin"),
    validate(CustomerValidations.getCustomer),
    customerController.getCustomer
  )
  .delete(
    auth("customer", "admin"),
    validate(CustomerValidations.deleteCustomer),
    customerController.deleteCustomer
  )
  .put(
    auth("customer", "admin"),
    validate(CustomerValidations.updateCustomer),
    customerController.updateCustomer
  );

module.exports = router;
