const Joi = require("joi").extend(require("@joi/date"));
const { objectId, password } = require("./custom.validation");

const buySubscription = {
  query: Joi.object().keys({
    subscriptionType: Joi.string().custom(objectId).required(),
    code: Joi.string(),
  }),
};

const createInvoice = {
  body: Joi.object().keys({
    user: Joi.string().required().custom(objectId),
    amount: Joi.number().required(),
  }),
};

module.exports = {
  buySubscription,
  createInvoice,
};
