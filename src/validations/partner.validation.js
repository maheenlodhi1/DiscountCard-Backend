const Joi = require("joi").extend(require("@joi/date"));
const { objectId, password } = require("./custom.validation");

const createPartner = {
  body: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().custom(password).required(),
    phoneNo: Joi.string().required(),
    businessName: Joi.string().required(),
  }),
};
const updatePartner = {
  params: Joi.object().keys({
    partnerId: Joi.string().custom(objectId),
  }),
  body: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    password: Joi.string(),
    phoneNo: Joi.string(),
    photoUrl: Joi.string(),
    country: Joi.string(),
    nationality: Joi.string(),
    state: Joi.string(),
    businessName: Joi.string(),
    tradeLicense: Joi.string(),
    offers: Joi.array().items(Joi.custom(objectId)),
    isActive: Joi.boolean(),
  }),
};

const getPartner = {
  params: Joi.object().keys({
    partnerId: Joi.string().custom(objectId),
  }),
};
const deletePartner = {
  params: Joi.object().keys({
    partnerId: Joi.string().custom(objectId),
  }),
};

const addPaymentDetails = {
  body: Joi.object().keys({
    partnerId: Joi.string().custom(objectId),
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
    partnerId: Joi.string().custom(objectId),
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
  createPartner,
  updatePartner,
  getPartner,
  deletePartner,
  addPaymentDetails,
  updatePaymentDetails,
};
