const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { PartnerValidations } = require("../validations");
const { partnerController } = require("../controllers");

const router = express.Router();

router
  .route("/app/dashboard/stats")
  .get(auth("partners"), partnerController.getAppDashboardStats);

router
  .route("/dashboard/stats")
  .get(auth("partners"), partnerController.getOffersStatsCount);

router
  .route("/dashboard/offer-stats")
  .get(auth("partners"), partnerController.getOffersYearlyStats);

router
  .route("/dashboard/revenue-stats")
  .get(auth("partners"), partnerController.getOffersYearlyRevenueStats);
router
  .route("/")
  .get(auth("partner", "admin"), partnerController.getPartners)
  .post(
    auth("partner", "admin"),
    validate(PartnerValidations),
    partnerController.createPartner
  );

router
  .route("/:partnerId")
  .get(
    auth("partner", "admin"),
    validate(PartnerValidations.getPartner),
    partnerController.getPartner
  )
  .delete(
    auth("partner", "admin"),
    validate(PartnerValidations.deletePartner),
    partnerController.deletePartner
  )
  .put(
    auth("partner", "admin"),
    validate(PartnerValidations.updatePartner),
    partnerController.updatePartner
  );

module.exports = router;
