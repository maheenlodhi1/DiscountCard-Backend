const Joi = require("joi").extend(require("@joi/date"));
const { objectId } = require("./custom.validation");

const updateUser = {
  body: Joi.object({
    type: Joi.string().valid("customer", "partner").required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    phoneNo: Joi.string().required(),
    businessName: Joi.string().when("type", {
      is: "partner",
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};
const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const addPaymentDetails = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    accountType: Joi.string().required(),
    accountDetails: Joi.object({
      cardNumber: Joi.string().required(),
      cardName: Joi.string().required(),
      expiryMonth: Joi.string().required(),
      expiryYear: Joi.string().required(),
      cvv: Joi.string().required(),
    }).required(),
  }),
};

const updatePaymentDetails = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    accountType: Joi.string(),
    accountDetails: Joi.object({
      cardNumber: Joi.string(),
      cardName: Joi.string(),
      expiryMonth: Joi.string(),
      expiryYear: Joi.string(),
      cvv: Joi.string(),
    }),
  }),
};
module.exports = {
  updateUser,
  getUser,
  deleteUser,
  addPaymentDetails,
  updatePaymentDetails,
};
