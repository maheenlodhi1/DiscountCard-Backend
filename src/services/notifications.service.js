const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Notifications } = require("../models");
const createNotification = async (notificationData) => {
  const notification = await Notifications.create(notificationData);
  if (!notification) {
    throw new ApiError(500, "Something went wrong");
  }
  return notification;
};
const getNotifications = async (filters, options) => {
  const notification = await Notifications.paginate(filters, options);
  return notification;
};

const getNotificationById = async (notificationId) => {
  const notification = await Notifications.findById(notificationId);
  if (!notification)
    throw new ApiError(httpStatus.NOT_FOUND, "Notifications not found!");
  return notification;
};

const getUserNotifications = async (userType, userId) => {
  const notifications = await Notifications.find({ [userType]: userId });
  if (!notifications)
    throw new ApiError(httpStatus.NOT_FOUND, "Notifications not found!");
  return notifications;
};

const updateNotification = async (notificationId, updateBody) => {
  const notification = await getNotificationById(notificationId);
  Object.assign(notification, updateBody);
  await notification.save();
};

const deleteNotification = async (notificationId) => {
  const notification = await getNotificationById(notificationId);
  await notification.remove();
};

module.exports = {
  createNotification,
  getNotifications,
  getUserNotifications,
  updateNotification,
  deleteNotification,
  getNotificationById,
};
