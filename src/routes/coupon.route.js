const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { CouponValidation } = require("../validations");
const { CouponController } = require("../controllers");

const router = express.Router();
router
  .route("/")
  .post(
    auth("admin"),
    validate(CouponValidation.addCoupon),
    CouponController.createCoupon
  )
  .get(auth("admin"), CouponController.getCoupons);
router
  .route("/:couponId")
  .put(
    auth("admin"),
    validate(CouponValidation.getCoupon),
    CouponController.updateCoupon
  )
  .delete(
    auth("admin"),
    validate(CouponValidation.getCoupon),
    CouponController.deleteCoupon
  );

router
  .route("/apply-coupon")
  .post(auth("customer"), CouponController.applyCoupon);

module.exports = router;
