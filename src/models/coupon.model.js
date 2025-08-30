const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const { boolean } = require("joi");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    code: {
      type: String,
      unique: true,
    },
    discount: {
      type: Number,
    },
    expirationDate: {
      type: Date,
    },
    maxUsageCount: {
      type: Number,
    },
    currentUsageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      default: "membership",
      private: true,
    },
    useHistory: [
      {
        type: String,
        ref: "Customer",
      },
    ],
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
couponSchema.set("toJSON", { virtuals: true });
couponSchema.plugin(toJSON, { virtuals: true });
couponSchema.plugin(paginate);
couponSchema.virtual("status").get(function () {
  if (this.currentUsageCount >= this.maxUsageCount) {
    return "Limit Reached";
  }
  return this.expirationDate > new Date() ? "Active" : "Expired";
});

const Coupon = mongoose.model("Coupons", couponSchema);

module.exports = Coupon;
