const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { toJSON, paginate } = require("./plugins");

const adminUserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    password: {
      type: String,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
      private: true, // used by the toJSON plugin
    },
    phoneNo: {
      type: String,
      trim: true,
    },
    photoUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    country: {
      type: String,
    },
    nationality: {
      type: String,
    },
    role: {
      type: String,
      default: "controller",
    },
  },
  {
    timestamps: true,
  }
);

adminUserSchema.set("toObject", { virtuals: true });
adminUserSchema.set("toJSON", { virtuals: true });
// add plugin that converts mongoose to json
adminUserSchema.plugin(toJSON);
adminUserSchema.plugin(paginate);
/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
adminUserSchema.virtual("userType").get(function () {
  return "admin";
});
adminUserSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

adminUserSchema.statics.isPhoneNoTaken = async function (
  phoneNo,
  excludeUserId
) {
  const user = await this.findOne({ phoneNo, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>} b
 */
adminUserSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

adminUserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const AdminUser = mongoose.model("AdminUser", adminUserSchema);

module.exports = AdminUser;
