const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const {
  PushNotificationsService,
  NotificationsService,
} = require("../services");
const { searchQueryConverter } = require("../utils/searchQueryConverter");

const subscribePushNotifications = catchAsync(async (req, res) => {
  const pushNotification = await PushNotificationsService.saveNotificationToken(
    req.body
  );
  if (!pushNotification) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error while subscribing to push notifications"
    );
  }
  res.status(httpStatus.OK).send({ message: "Subscribed to notifications" });
});

const broadcastNotification = catchAsync(async (req, res) => {
  const notification = await NotificationsService.getNotificationById(
    req.params.notificationId
  );
  // const { targetUsers, title, message: body, additionalData } = notification;
  // const tokens = await PushNotificationsService.getUserTokens(targetUsers);
  // const result = await PushNotificationsService.sendBroadcastNotifications(
  //   tokens,
  //   title,
  //   body
  // );
  // res.send(result);
  res.status(200).send(notification);
});

const createNotification = catchAsync(async (req, res) => {
  const notification = await NotificationsService.createNotification(req.body);
  return res.status(httpStatus.OK).send(notification);
});

const getNotifications = catchAsync(async (req, res) => {
  let filter = pick(req.query, ["search"]);
  if (filter.search) {
    let searchQuery = searchQueryConverter(filter.search);
    filter = {
      ...filter,
      ...searchQuery,
    };
    delete filter["search"];
  }
  filter["type"] = "broadcast";
  const options = pick(req.query, ["sortBy", "limit", "page"]);

  const result = await NotificationsService.getNotifications(filter, options);
  res.send(result);
});

const updateNotification = catchAsync(async (req, res) => {
  const notification = await NotificationsService.updateNotification(
    req.params.notificationId,
    req.body
  );
  return res.status(httpStatus.OK).send(notification);
});

const deleteNotification = catchAsync(async (req, res) => {
  const notification = await NotificationsService.deleteNotification(
    req.params.notificationId
  );
  return res.status(httpStatus.OK).send(notification);
});

const getNotification = catchAsync(async (req, res) => {
  const notification = await NotificationsService.getNotificationById(
    req.params.notificationId
  );
  return res.status(httpStatus.OK).send(notification);
});
module.exports = {
  subscribePushNotifications,
  broadcastNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  getNotifications,
  getNotification,
};
