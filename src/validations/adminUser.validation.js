const Joi = require("joi").extend(require("@joi/date"));
const { objectId, password } = require("./custom.validation");

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    photoUrl: Joi.string(),
    phoneNo: Joi.string(),
    country: Joi.string(),
  }),
};
const registerUser = {
  body: Joi.object().keys({
    firstName: Joi.string(),
    surName: Joi.string(),
    bio: Joi.string(),
    photoUrl: Joi.string(),
    phoneNo: Joi.string(),
    isActive: Joi.bool(),
    role: Joi.string(),
    country: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().required().custom(password),
  }),
};
const chatLink = {
  body: Joi.object().keys({
    chat: Joi.object,
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
const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};
const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
    token: Joi.string().required(),
  }),
};

const setReferralCommission = {
  body: Joi.object().keys({
    referralCommission: Joi.number().required(),
  }),
};
const updateReferralCommission = {
  params: {
    id: Joi.string().custom(objectId),
  },
  body: Joi.object().keys({
    referralCommission: Joi.number().required(),
  }),
};
module.exports = {
  updateUser,
  getUser,
  deleteUser,
  chatLink,
  login,
  registerUser,
  forgotPassword,
  resetPassword,
  setReferralCommission,
  updateReferralCommission,
};
