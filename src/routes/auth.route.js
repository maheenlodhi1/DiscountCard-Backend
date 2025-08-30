const express = require("express");
const validate = require("../middlewares/validate");
const authValidation = require("../validations/auth.validation");
const authController = require("../controllers/auth.controller");
const auth = require("../middlewares/auth");
const httpStatus = require("http-status");
const router = express.Router();
router
  .route("/send-invite")
  .post(validate(authValidation.sendInvite), authController.sendInvite);
router.post(
  "/register",
  validate(authValidation.register),
  authController.register
);
router.get(
  "/verify-email",
  validate(authValidation.verifyEmail),
  authController.verifyEmail
);
router.post("/login", validate(authValidation.login), authController.login);
router.delete(
  "/logout/:userId",
  validate(authValidation.logout),
  authController.logout
);

router.post(
  "/forgot-password",
  validate(authValidation.forgotPassword),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  validate(authValidation.resetPassword),
  authController.resetPassword
);
router.post(
  "/send-otp",
  validate(authValidation.sendOtp),
  authController.sendOtp
);
router.post(
  "/verify-otp",
  validate(authValidation.verifyOtp),
  authController.verifyUserOtp
);

router
  .route("/me")
  .get(auth("customer", "partner"), authController.getAuthUserDetails);
router.post(
  "/change-password",
  auth("partner", "customer"),
  validate(authValidation.changePassword),
  authController.changePassword
);

router.post(
  "/refresh-tokens",
  validate(authValidation.refreshTokens),
  authController.refreshTokens
);

module.exports = router;
