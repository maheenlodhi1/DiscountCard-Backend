const mongoose = require("mongoose");
const validator = require("validator");
const { toJSON, paginate } = require("./plugins");
const tokenTypes = require("../config/tokens");
const tokensSchema = mongoose.Schema(
  {
    token: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(tokenTypes),
      trim: true,
    },
    retryCount: {
      type: Number,
      default: 1,
    },
    userEmail: {
      type: String,
    },
    creationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
tokensSchema.plugin(toJSON);

/**
 * @typedef User
 */
const Tokens = mongoose.model("Revoked Tokens", tokensSchema);

module.exports = Tokens;
