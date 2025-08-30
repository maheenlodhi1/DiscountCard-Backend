const Joi = require("joi").extend(require("@joi/date"));
const { objectId } = require("./custom.validation");

const updatePromotion = {
  params: Joi.object().keys({
    promotionId: Joi.string().custom(objectId),
  }),
  body: Joi.object({
    partner: Joi.string().custom(objectId),
    title: Joi.string().trim(),
    subTitle: Joi.string().trim(),
    images: Joi.array().items(Joi.string()),
    description: Joi.string().trim(),
    categoryName: Joi.string(),
    promotionStatus: Joi.string().valid("pending", "approved", "rejected"),
    rejectionReason: Joi.string(),
    discount: Joi.number(),
    locations: Joi.array().items(
      Joi.object({
        address: Joi.string(),
        coordinates: Joi.object({
          type: Joi.string().optional(),
          coordinates: Joi.array().items(Joi.number().required()).required(),
        }),
      })
    ),
    offerAvailTime: Joi.object({
      startTime: Joi.string().messages({
        "string.empty": "Start time is required",
      }),
      endTime: Joi.string().messages({
        "string.empty": "End time is required",
      }),
    }),

    days: Joi.array().items(Joi.string()).min(1).messages({
      "array.min": "At least one day must be selected",
    }),
    isFeatured: Joi.boolean().default(false),
    isActive: Joi.boolean(),
    isShowOnHomepage: Joi.boolean(),
    review: Joi.array().items(Joi.string().custom(objectId)),
  }),
};

const getPromotion = {
  params: Joi.object().keys({
    promotionId: Joi.string().custom(objectId),
  }),
};
const deletePromotion = {
  params: Joi.object().keys({
    promotionId: Joi.string().custom(objectId),
  }),
};

const createPromotion = {
  body: Joi.object({
    partner: Joi.string().custom(objectId).required(),
    title: Joi.string().trim().required(),
    subTitle: Joi.string().trim(),
    images: Joi.array().items(Joi.string()),
    description: Joi.string().trim(),
    categoryName: Joi.string(),
    expiryDate: Joi.date(),
    duration: Joi.string(),
    discount: Joi.number(),
    offerAvailTime: Joi.object({
      startTime: Joi.string().required().messages({
        "string.empty": "Start time is required",
      }),
      endTime: Joi.string().required().messages({
        "string.empty": "End time is required",
      }),
    }).required(),

    days: Joi.array().items(Joi.string()).min(1).required().messages({
      "array.min": "At least one day must be selected",
    }),
    locations: Joi.array().items(
      Joi.object({
        address: Joi.string(),
        coordinates: Joi.object({
          coordinates: Joi.array().items(Joi.number().required()).required(),
        }),
      })
    ),
    isFeatured: Joi.boolean(),
  }),
};

const redeemOffer = {
  params: Joi.object().keys({
    promotionId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    partner: Joi.string().required().custom(objectId),
    customer: Joi.string().required().custom(objectId),
    totalBill: Joi.number().required(),
  }),
};
module.exports = {
  getPromotion,
  deletePromotion,
  updatePromotion,
  createPromotion,
  redeemOffer,
};
