const Joi = require("joi").extend(require("@joi/date"));
const { objectId } = require("./custom.validation");

const addCoupon = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    discount: Joi.number().required(),
    expirationDate: Joi.date().required(),
    maxUsageCount: Joi.number().integer().min(0).required(),
  }),
};

const updateCoupon = {
  body: Joi.object().keys({
    name: Joi.string(),
    discount: Joi.number(),
    expirationDate: Joi.date(),
    maxUsageCount: Joi.number().integer().min(0),
  }),
};

const getCoupon = {
  params: Joi.object().keys({
    couponId: Joi.string().custom(objectId).required(),
  }),
};

const applyCoupon = {
  body: Joi.object().keys({
    itemId: Joi.string().custom(objectId).required(),
    code: Joi.string().required().length(8),
  }),
};

module.exports = {
  addCoupon,
  updateCoupon,
  getCoupon,
};
