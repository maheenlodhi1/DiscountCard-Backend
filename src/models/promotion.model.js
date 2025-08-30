const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const { translateText } = require("../utils/translateText");
const moment = require("moment");

const locationSchema = {
  address: {
    type: String,
  },
  coordinates: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
};

const promotionSchema = mongoose.Schema(
  {
    partner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Partners",
    },
    categoryId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Categories",
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    categoryName: {
      type: String,
    },
    subTitle: {
      type: String,
      trim: true,
    },
    invoiceLink: {
      session: {
        type: String,
      },
      price: {
        type: Number,
      },
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    type: {
      type: String,
      enum: ["offer", "service", "voucher"],
      default: "offer",
    },

    promotionStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "active"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
    },
    expiryDate: {
      type: Date,
      default: function () {
        const durationMap = {
          "1 Month": 1,
          "3 Months": 3,
          "6 Months": 6,
          "12 Months": 12,
        };

        return moment(this.createdAt)
          .add(durationMap[this.duration] || 1, "months")
          .toDate();
      },
    },
    locations: [locationSchema],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isShowOnHomepage: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: String,
      enum: ["1 Month", "2 Months", "3 Months", "6 Months", "12 Months"],
    },
    discount: {
      type: Number,
    },
    offerAvailTime: {
      startTime: { type: String },
      endTime: { type: String },
    },
    days: {
      type: [String],
      required: true,
    },
    views: [
      {
        count: {
          type: Number,
          default: 0,
        },
        date: {
          type: Date,
        },
      },
    ],
    orders: [
      {
        count: {
          type: Number,
          default: 0,
        },
        date: {
          type: Date,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        type: String,
        ref: "Reviews",
      },
    ],
    locale: {
      ar: {
        title: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        categoryName: {
          type: String,
        },
      },
      en: {
        title: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        categoryName: {
          type: String,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);
promotionSchema.index({ "locations.coordinates": "2dsphere" });
promotionSchema.pre("save", async function (next) {
  if (
    !this.isNew &&
    (this.isModified("title") ||
      this.isModified("description") ||
      this.isModified("categoryName"))
  ) {
    const targetLang = this.targetLang || "ar";
    const toLang = (targetLang || "ar") === "ar" ? "en" : "ar";

    if (this.isModified("title") && this.title) {
      this.locale[toLang].title = await translateText(this.title, toLang);
      this.locale[targetLang].title = this.title;
    }

    if (this.isModified("description") && this.description) {
      this.locale[toLang].description = await translateText(
        this.description,
        toLang
      );
      this.locale[targetLang].description = this.description;
    }

    if (this.isModified("categoryName") && this.categoryName) {
      this.locale[toLang].categoryName = await translateText(
        this.categoryName,
        toLang
      );
      this.locale[targetLang].categoryName = this.categoryName;
    }
  }
  delete this.targetLang;
  next();
});

// add plugin that converts mongoose to json
promotionSchema.plugin(toJSON);
promotionSchema.plugin(paginate);

const Promotion = mongoose.model("Promotions", promotionSchema);

module.exports = Promotion;
