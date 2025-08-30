const express = require("express");
const auth = require("../middlewares/auth");
const { UploaderController } = require("../controllers");
const { uploader } = require("../middlewares/uploader");

const router = express.Router();
router
  .route("/images")
  .post(
    auth("customer", "admin"),
    uploader().array("files"),
    UploaderController.uploadImages
  );

module.exports = router;
