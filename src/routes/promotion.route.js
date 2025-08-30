const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { PromotionValidation } = require("../validations");
const { PromotionController, partnerController } = require("../controllers");

const router = express.Router();
router
  .route("/redeem-offer/:promotionId")
  .post(
    auth("partner"),
    validate(PromotionValidation.redeemOffer),
    PromotionController.redeemOffer
  );
router
  .route("/create-invoice")
  .post(
    auth("admin"),
    validate(PromotionValidation.createInvoice),
    PromotionController.createPromotionInvoice
  );

router
  .route("/events")
  .post(PromotionController.createPromotionEvents)
  .get(PromotionController.getPromotionEvents);

router
  .route("/partner-offers")
  .get(auth("partner"), PromotionController.getPartnerPromotions);

router
  .route("/:promotionId/reviews")
  .get(PromotionController.getPromotionReviews);

router
  .route("/")
  .get(PromotionController.getPromotions)
  .post(
    auth("partner", "admin"),
    validate(PromotionValidation.createPromotion),
    PromotionController.createPromotion
  );
router
  .route("/:promotionId")
  .get(
    validate(PromotionValidation.getPromotion),
    PromotionController.getPromotion
  )
  .delete(
    auth("admin"),
    validate(PromotionValidation.deletePromotion),
    PromotionController.deletePromotion
  )
  .put(
    auth("partner", "admin"),
    validate(PromotionValidation.updatePromotion),
    PromotionController.updatePromotion
  );

module.exports = router;
