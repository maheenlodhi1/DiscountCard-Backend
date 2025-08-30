const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { toJSON, paginate } = require("./plugins");
const config = require("../config/config");
const { translateText } = require("../utils/translateText");
const customerSchema = mongoose.Schema({
  referralHistory: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "ReferralHistory",
  },
  referBy: {
    type: mongoose.SchemaTypes.ObjectId,
  },
  wallet: {
    type: String,
    ref: "User wallets",
  },
  lastReminderSentAt: {
    type: Date,
  },
});
const partnerSchema = mongoose.Schema({
  businessName: {
    type: String,
  },
  tradeLicense: {
    type: String,
  },
  offers: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Promotions",
    },
  ],
  locale: {
    ar: {
      businessName: {
        type: String,
      },
    },
    en: {
      businessName: {
        type: String,
      },
    },
  },
});
const userSchema = mongoose.Schema(
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
    country: {
      type: String,
    },
    nationality: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    faceIdEnabled: {
      type: Boolean,
      default: false,
    },
    faceId: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
    subscriptionStatus: {
      status: { type: String },
      reason: {
        type: String,
      },
    },
    subscription: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Subscriptions",
    },
    state: {
      type: String,
    },
    locale: {
      en: {
        firstName: {
          type: String,
          trim: true,
        },
        lastName: {
          type: String,
          trim: true,
        },
        country: {
          type: String,
        },
        nationality: {
          type: String,
        },
      },
      ar: {
        firstName: {
          type: String,
          trim: true,
        },
        lastName: {
          type: String,
          trim: true,
        },
        country: {
          type: String,
        },
        nationality: {
          type: String,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index(
  { email: 1, phoneNo: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

userSchema.pre("save", translateData);

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);
/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({
    email,
    isDeleted: false,
  });

  return !!user;
};

userSchema.statics.isPhoneNoTaken = async function (phoneNo, excludeUserId) {
  const user = await this.findOne({
    phoneNo,
    isDeleted: false,
  });
  return !!user;
};
userSchema.virtual("userType").get(function () {
  // Logic to determine userType based on the value of __t
  switch (this.__t) {
    case "Customers":
      return "customer";
    case "Partners":
      return "partner";
    default:
      return "Unknown";
  }
});

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>} b
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

async function translateData(next) {
  if (
    !this.isNew &&
    (this.isModified("firstName") ||
      this.isModified("lastName") ||
      this.isModified("businessName"))
  ) {
    const targetLang = this.targetLang || "ar";
    const toLang = (targetLang || "ar") === "ar" ? "en" : "ar";

    if (this.isModified("firstName") && this.firstName) {
      this.locale[toLang].firstName = await translateText(
        this.firstName,
        toLang
      );
      this.locale[targetLang].firstName = this.firstName;
    }

    if (this.isModified("lastName") && this.lastName) {
      this.locale[toLang].lastName = await translateText(this.lastName, toLang);
      this.locale[targetLang].lastName = this.lastName;
    }

    // if (this.isModified("country") && this.country) {
    //   this.locale[toLang].country = await translateText(this.country, toLang);
    //   this.locale[targetLang].country = this.country;
    // }
    // if (this.isModified("nationality") && this.nationality) {
    //   this.locale[toLang].nationality = await translateText(
    //     this.nationality,
    //     toLang
    //   );
    //   this.locale[targetLang].nationality = this.nationality;
    // }

    if (this.isModified("businessName") && this.businessName) {
      this.locale[toLang].businessName = await translateText(
        this.businessName,
        toLang
      );
      this.locale[targetLang].businessName = this.businessName;
    }
  }
  delete this.targetLang;
  next();
}

/**
 * @typedef User
 */
const User = mongoose.model("User", userSchema);
const Partner = User.discriminator("Partners", partnerSchema);
const Customer = User.discriminator("Customers", customerSchema);
module.exports = { User, Customer, Partner };
