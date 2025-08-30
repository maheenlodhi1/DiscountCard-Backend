const Joi = require("joi").extend(require("@joi/date"));
const { objectId } = require("./custom.validation");

const addPayment = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    driverId: Joi.string().custom(objectId).required(),
    amount: Joi.string().required(),
  }),
};
const commonFields = {
  type: Joi.string().valid("alansari", "bank").required(),
  phoneNo: Joi.string().required(),
};

const managePayoutDetails = {
  body: Joi.object({
    ...commonFields,
    name: Joi.when("type", {
      is: "alansari",
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    accountNumber: Joi.when("type", {
      is: "bank",
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    iban: Joi.when("type", {
      is: "bank",
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    beneficiaryName: Joi.when("type", {
      is: "bank",
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
  }),
};

module.exports = {
  addPayment,
  managePayoutDetails,
};
