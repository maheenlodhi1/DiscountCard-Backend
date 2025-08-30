const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { contactValidations } = require("../validations");
const { contactController } = require("../controllers");

const router = express.Router();

router
  .route("/internal")
  .post(
    auth("customer", "partner"),
    validate(contactValidations.internalContactUs),
    contactController.emailContactUs
  );

router
  .route("/")
  .post(
    auth(["partner"]),
    validate(contactValidations.contactUs),
    contactController.contactUs
  )
  .get(contactController.getContactsForms);

router
  .route("/:contactId")

  .get(contactController.getContactUsById);

module.exports = router;
