const Joi = require("joi").extend(require("@joi/date"));
const { objectId } = require("./custom.validation");

const contactUs = {
  body: Joi.object({
    fullName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phoneNo: Joi.string().optional(),
    subject: Joi.string().required(),
    details: Joi.string().required(),
  }),
};

const internalContactUs = {
  body: Joi.object({
    subject: Joi.string().required(),
    details: Joi.string().required(),
  }),
};

module.exports = {
  contactUs,
  internalContactUs,
};
