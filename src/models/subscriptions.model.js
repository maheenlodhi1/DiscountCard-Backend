const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const SubscriptionsSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      trim: true,
    },
    cardName: {
      type: String,
      trim: true,
    },
    barcode: {
      type: String,
    },
    barcodeId: {
      type: String,
    },
    subscriptionType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionTypes", // Reference SubscriptionTypes
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: function () {
        if (this.startDate && this.duration) {
          const expiry = new Date(this.startDate);
          expiry.setFullYear(
            expiry.getFullYear(),
            expiry.getMonth() + this.duration
          );
          return expiry;
        }
        return undefined;
      },
    },
    duration: {
      type: Number,
      default: function () {
        return this.subscriptionType?.duration || 12; // Default duration
      },
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    locale: {
      en: {
        cardName: {
          type: String,
          trim: true,
        },
      },
      ar: {
        cardName: {
          type: String,
          trim: true,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
SubscriptionsSchema.plugin(toJSON);

/**
 * @typedef Subscriptions
 */
const Subscriptions = mongoose.model("Subscriptions", SubscriptionsSchema);

module.exports = Subscriptions;
