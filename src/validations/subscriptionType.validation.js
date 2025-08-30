const Joi = require("joi").extend(require("@joi/date"));
const { objectId } = require("./custom.validation");

const addSubscriptionType = {
  body: Joi.object()
    .keys({
      name: Joi.string().trim().required(),
      memberShipType: Joi.string().valid("silver", "gold", "premium"),
      amount: Joi.number().min(0).required(),
      duration: Joi.number().required(),
      packageType: Joi.string().valid(
        "basic",
        "professional",
        "premium",
        "custom"
      ),
      type: Joi.string().valid("package", "membership").required(),
      targetAudience: Joi.string().valid("customer", "partner"),
    })
    .custom((value, helpers) => {
      if (value.type === "membership" && value.targetAudience !== "customer") {
        return helpers.message(
          "For memberships, targetAudience must be 'customer'."
        );
      }
      if (value.type === "package" && value.targetAudience !== "partner") {
        return helpers.message(
          "For packages, targetAudience must be 'partner'."
        );
      }

      if (value.type !== "package" && value.packageType) {
        return helpers.message(
          "packageType is only applicable for type 'package'."
        );
      }

      return value;
    }),
};

const updateSubscriptionType = {
  params: Joi.object().keys({ subscriptionTypeId: Joi.string().required() }),
  body: Joi.object().keys({
    name: Joi.string(),
    type: Joi.string().valid("premium", "silver", "gold"),
    amount: Joi.number(),
    duration: Joi.number(),
  }),
};

const getSubscriptionType = {
  params: Joi.object().keys({
    subscriptionTypeId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  addSubscriptionType,
  updateSubscriptionType,
  getSubscriptionType,
};
