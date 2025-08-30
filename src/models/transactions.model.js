const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const transactionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Customers",
    },
    partner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Partners",
    },
    promotionId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Promotions",
    },
    offerDiscount: {
      type: Number,
    },
    offerExpiryDate: {
      type: Date,
    },
    totalBill: {
      type: Number,
    },
    discountPrice: {
      type: Number,
    },
    totalSavings: {
      type: Number,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
transactionSchema.plugin(toJSON);
transactionSchema.plugin(paginate);
const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
