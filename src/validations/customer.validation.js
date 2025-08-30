const Joi = require("joi").extend(require("@joi/date"));
const { objectId, password } = require("./custom.validation");
const createCustomer = {
  body: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().custom(password).required(),
    phoneNo: Joi.string().required(),
    country: Joi.string(),
    nationality: Joi.string(),
    state: Joi.string(),
  }),
};
const updateCustomer = {
  params: Joi.object().keys({
    customerId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    phoneNo: Joi.string(),
    photoUrl: Joi.string().allow(""),
    country: Joi.string(),
    nationality: Joi.string(),
    isActive: Joi.boolean(),
    state: Joi.string(),
  }),
};

const getCustomer = {
  params: Joi.object().keys({
    customerId: Joi.string().custom(objectId),
  }),
};

const buyMembership = {
  query: Joi.object().keys({
    membershipType: Joi.string().custom(objectId).required(),
    code: Joi.string(),
  }),
};
const deleteCustomer = {
  params: Joi.object().keys({
    customerId: Joi.string().custom(objectId),
  }),
};

const addPaymentDetails = {
  body: Joi.object().keys({
    customerId: Joi.string().custom(objectId),
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
    customerId: Joi.string().custom(objectId),
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
  createCustomer,
  updateCustomer,
  getCustomer,
  deleteCustomer,
  addPaymentDetails,
  updatePaymentDetails,
  buyMembership,
};
