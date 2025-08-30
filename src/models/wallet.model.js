const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const walletSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      trim: true,
    },
    customerId: {
      type: String,
      trim: true,
    }, //this customerId is the id for stripe payment methods
    accountId: {
      type: String,
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    hasPayoutMethod: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
walletSchema.plugin(toJSON);
// categorySchema.plugin(paginate);

/**
 * @typedef MembershipSubscriptions
 */
const Wallet = mongoose.model("User wallets", walletSchema);

module.exports = Wallet;
