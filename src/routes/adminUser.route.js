const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { adminValidations } = require("../validations");
const { adminUserController } = require("../controllers");

const router = express.Router();
router.route("/dashboard").get(adminUserController.getDashboardStats);

router
  .route("/referralCommission")
  .get(auth("admin"), adminUserController.getReferralCommission)
  .post(
    auth("admin"),
    validate(adminValidations.setReferralCommission),
    adminUserController.setReferralCommission
  );

router
  .route("/referralCommission/:id")
  .put(
    auth("admin"),
    validate(adminValidations.updateReferralCommission),
    adminUserController.updateReferralCommission
  );

router
  .route("/login")
  .post(validate(adminValidations.login), adminUserController.login);

router
  .route("/register")
  .post(validate(adminValidations.registerUser), adminUserController.register);

router
  .route("/forgot-password")
  .post(
    validate(adminValidations.forgotPassword),
    adminUserController.forgotPassword
  );

router
  .route("/reset-password")
  .post(
    validate(adminValidations.resetPassword),
    adminUserController.resetPassword
  );

router.route("/").get(auth("admin"), adminUserController.geCurrentUser);

router
  .route("/:userId")
  .get(validate(adminValidations.getUser), adminUserController.getUser)
  .delete(validate(adminValidations.deleteUser), adminUserController.deleteUser)
  .put(validate(adminValidations.updateUser), adminUserController.updateUser);

module.exports = router;
