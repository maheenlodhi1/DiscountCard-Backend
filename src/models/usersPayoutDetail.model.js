const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { toJSON, paginate } = require("./plugins");
const config = require("../config/config");
const { translateText } = require("../utils/translateText");
const alansariDetailsSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});
const bankDetailsSchema = mongoose.Schema({
  bankName: {
    type: String,
    required: true,
  },
  iban: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  beneficiaryName: {
    type: String,
    required: true,
  },
});
const payoutSchema = mongoose.Schema(
  {
    type: {
      type: String,
    },
    phoneNo: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
payoutSchema.plugin(toJSON);
payoutSchema.plugin(paginate);

const PayoutDetails = mongoose.model("PayoutDetails", payoutSchema);
const AlansariDetails = PayoutDetails.discriminator(
  "Alansari",
  alansariDetailsSchema
);
const BankDetails = PayoutDetails.discriminator("Bank", bankDetailsSchema);
module.exports = { PayoutDetails, AlansariDetails, BankDetails };
