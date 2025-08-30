const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { notificationValidation } = require("../validations");
const { NotificationsController } = require("../controllers");

const router = express.Router();

router
  .route("/")
  .post(
    auth("admin"),
    validate(notificationValidation.createNotification),
    NotificationsController.createNotification
  )
  .get(auth("admin"), NotificationsController.getNotifications);

router
  .route("/:notificationId")
  .put(
    auth("admin"),
    validate(notificationValidation.getNotification),
    NotificationsController.updateNotification
  )
  .delete(
    auth("admin"),
    validate(notificationValidation.getNotification),
    NotificationsController.deleteNotification
  )
  .get(auth("admin"), NotificationsController.getNotification);

router
  .route("/broadcast/:notificationId")
  .get(
    auth("admin"),
    validate(notificationValidation.broadcastNotifications),
    NotificationsController.broadcastNotification
  );
router
  .route("/subscribe")
  .post(
    auth("customer", "partner"),
    validate(notificationValidation.subscribeNotification),
    NotificationsController.subscribePushNotifications
  );

module.exports = router;
