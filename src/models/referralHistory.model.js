const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const config = require("../config/config");

const referralHistorySchema = new mongoose.Schema(
  {
    referee: {
      type: mongoose.SchemaTypes.ObjectId,
      refPath: "refereeModel",
    },
    refereeModel: {
      type: String,
      required: true,
      enum: ["Customers", "Partners"],
    },
    referralLink: {
      type: String,
      default: function () {
        return `${config.clientUserUrl}discount/${this.referee}`;
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    useHistory: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        refPath: "refereeModel",
      },
    ],
  },
  { timestamps: true }
);

// Add plugin that converts mongoose to JSON
referralHistorySchema.set("toJSON", { virtuals: true });
referralHistorySchema.plugin(toJSON, { virtuals: true });
referralHistorySchema.plugin(paginate);

const ReferralHistory = mongoose.model(
  "ReferralHistory",
  referralHistorySchema
);

module.exports = ReferralHistory;
