const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const subscriptionTypesSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
    },
    memberShipType: {
      type: String,
      enum: ["silver", "gold", "premium"],
      default: undefined,
    },
    packageType: {
      type: String,
      enum: ["basic", "professional", "premium", "custom"],
      default: undefined, // Only applies to partners (packages)
    },
    type: {
      type: String,
      enum: ["package", "membership"],
      required: true, // Distinguish between package and membership
    },
    targetAudience: {
      type: String,
      enum: ["customer", "partner"],
      default: function () {
        return this.type === "membership" ? "customer" : "partner";
      },
    },
    amount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
subscriptionTypesSchema.plugin(toJSON);

const SubscriptionTypes = mongoose.model(
  "SubscriptionTypes",
  subscriptionTypesSchema
);

module.exports = SubscriptionTypes;
