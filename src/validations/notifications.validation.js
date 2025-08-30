const Joi = require("joi").extend(require("@joi/date"));
const { objectId } = require("./custom.validation");

const broadcastNotifications = {
  params: Joi.object().keys({
    notificationId: Joi.string().required().custom(objectId),
  }),
};

const subscribeNotification = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    userType: Joi.string().valid("customer", "partner"),
    Platform: Joi.string().valid("android", "ios", "web"),
    token: Joi.string(),
  }),
};

const createNotification = {
  body: Joi.object({
    title: Joi.string().trim().required().messages({
      "string.empty": "Title is required.",
      "any.required": "Title is required.",
    }),
    message: Joi.string().trim().required().messages({
      "string.empty": "Message is required.",
      "any.required": "Message is required.",
    }),
    targetUsers: Joi.string().optional().messages({
      "string.base": "TargetUsers must be valid value customer, partner or all",
    }),
    additionalData: Joi.object().optional().allow(null).messages({
      "object.base": "AdditionalData must be an object.",
    }),
  }),
};

const updateNotification = {
  params: Joi.object({
    notificationId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object({
    title: Joi.string().trim().messages({
      "string.empty": "Title is required.",
      "any.required": "Title is required.",
    }),
    message: Joi.string().trim().messages({
      "string.empty": "Message is required.",
      "any.required": "Message is required.",
    }),
    targetUsers: Joi.string().optional().messages({
      "string.base": "TargetUsers must be valid value customer, partner or all",
    }),
    additionalData: Joi.object().optional().allow(null).messages({
      "object.base": "AdditionalData must be an object.",
    }),
  }),
};

const getNotification = {
  params: Joi.object({
    notificationId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  subscribeNotification,
  broadcastNotifications,
  createNotification,
  updateNotification,
  getNotification,
};
