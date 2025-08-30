const Joi = require("joi").extend(require("@joi/date"));
const { objectId } = require("./custom.validation");

const createPopupAd = {
  body: Joi.object({
    promotion: Joi.string().custom(objectId).optional(), // Must be a valid ObjectId format
    title: Joi.string().allow("").optional(),
    description: Joi.string().allow("").optional(),
    imageUrl: Joi.string(),
    duration: Joi.number().integer().min(1).optional(),
    startDate: Joi.date().optional(),
    expirationDate: Joi.date().optional(),
  }),
};

const updatePopupAd = {
  params: Joi.object().keys({
    adId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object({
    title: Joi.string().allow("").optional(),
    description: Joi.string().allow("").optional(),
    imageUrl: Joi.string().allow("").optional(),
    duration: Joi.number().integer().min(1).optional(),
    startDate: Joi.date().optional(),
    expirationDate: Joi.date().optional(),
  }),
};

const getPopupAd = {
  params: Joi.object().keys({
    adId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createPopupAd,
  getPopupAd,
  updatePopupAd,
};
