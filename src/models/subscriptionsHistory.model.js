const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const subscriptionHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subscriptionType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionTypes",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["expired", "cancelled"],
    required: true,
  },
  duration: {
    type: Number, // Duration in months
    required: true,
  },
  archivedAt: {
    type: Date,
    default: Date.now, // When the subscription was archived
  },
});

// add plugin that converts mongoose to json
subscriptionHistorySchema.plugin(toJSON);

/**
 * @typedef Subscriptions
 */
module.exports = mongoose.model(
  "SubscriptionHistory",
  subscriptionHistorySchema
);
