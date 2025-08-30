const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const payoutRequestsSchema = mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    accountId: {
      type: String,
      required: true,
      ref: "PayoutDetails",
    },
    userId: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
    },
    receiptUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
payoutRequestsSchema.plugin(toJSON);
payoutRequestsSchema.plugin(paginate);

/**
 * @typedef MembershipSubscriptions
 */
const PayoutRequest = mongoose.model(
  "User payoutRequests",
  payoutRequestsSchema
);

module.exports = PayoutRequest;
