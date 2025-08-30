const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { popupAdValidation } = require("../validations");
const { PopupAdsController } = require("../controllers");

const router = express.Router();

router
  .route("/")
  .post(
    auth("admin"),
    validate(popupAdValidation.createPopupAd),
    PopupAdsController.createPopupAd
  )
  .get(auth("admin"), PopupAdsController.getPopupAds);

router.route("/show").get(PopupAdsController.getPopupAd);

router
  .route("/:adId")
  .get(
    auth("admin"),
    validate(popupAdValidation.getPopupAd),
    PopupAdsController.getPopupAdById
  )
  .delete(
    auth("admin"),
    validate(popupAdValidation.getPopupAd),
    PopupAdsController.deletePopupAd
  )
  .put(
    auth("admin"),
    validate(popupAdValidation.getPopupAd),
    PopupAdsController.updatePopupAd
  );

module.exports = router;
