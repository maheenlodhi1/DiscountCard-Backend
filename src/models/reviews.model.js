const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const Promotion = require("./promotion.model");
const { translateText } = require("../utils/translateText");

const reviewSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Customers",
    },
    partner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Partners",
    },
    promotion: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Promotions",
    },
    customerName: {
      type: String,
    },
    customerImage: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    comment: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    locale: {
      ar: {
        customerName: {
          type: String,
        },
        comment: {
          type: String,
        },
      },
      en: {
        customerName: {
          type: String,
        },
        comment: {
          type: String,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
reviewSchema.plugin(toJSON);
reviewSchema.plugin(paginate);

reviewSchema.post("save", async function (doc, next) {
  try {
    const offerId = doc.promotion;

    const existingOffer = await Promotion.findById(offerId);
    const totalRating =
      existingOffer.averageRating * existingOffer.reviews.length;

    const newTotalRating = totalRating + doc.rating;

    const newAverageRating =
      newTotalRating / (existingOffer.reviews.length + 1);

    await Promotion.findByIdAndUpdate(offerId, {
      averageRating: newAverageRating,
    });

    next();
  } catch (error) {
    next(error);
  }
});
/**
 * @typedef Review
 */
const Review = mongoose.model("Reviews", reviewSchema);

module.exports = Review;
