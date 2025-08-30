const Joi = require("joi").extend(require("@joi/date"));
const { objectId } = require("./custom.validation");

const feedback = Joi.object({
  customer: Joi.string().required(),
  customerName: Joi.string().required(),
  customerImage: Joi.string().required(),
  partner: Joi.string().required(),
  promotion: Joi.string().required(),
  rating: Joi.number(),
  comment: Joi.string(),
});

const getCustomerReviews = {
  params: Joi.object().keys({
    customerId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  feedback,
  getCustomerReviews,
};
