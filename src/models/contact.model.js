const mongoose = require("mongoose");
const validator = require("validator");
const { toJSON, paginate } = require("./plugins");

const contactSchema = mongoose.Schema(
  {
    user: {
      type: String,
      ref: "User",
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    phoneNo: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
    },
    details: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
contactSchema.plugin(toJSON);
contactSchema.plugin(paginate);

/**
 * @typedef User
 */
const Contact = mongoose.model("Contact US", contactSchema);

module.exports = Contact;
