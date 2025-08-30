const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const { translateText } = require("../utils/translateText");

const adsPopupSchema = mongoose.Schema(
  {
    promotion: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Promotion",
      trim: true,
    },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      default: function () {
        if (this.startDate && this.expirationDate) {
          const start = new Date(this.startDate);
          const end = new Date(this.expirationDate);
          const durationInMs = end - start;
          return Math.ceil(durationInMs / (1000 * 60 * 60 * 24));
        }
        return 1;
      },
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expirationDate: {
      type: Date,
      default: function () {
        const now = new Date();
        now.setDate(now.getDate() + this.duration); // Default is 1 day from the current date
        return now;
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
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
      },
    },
  },
  {
    timestamps: true, // Automatically ad createdAt and updatedAt timestamps
  }
);

// ad plugin that converts mongoose to json
adsPopupSchema.plugin(toJSON);
adsPopupSchema.plugin(paginate);

adsPopupSchema.pre("save", async function (next) {
  if (this.isModified("startDate") || this.isModified("expirationDate")) {
    if (this.startDate && this.expirationDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.expirationDate);
      this.duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // Calculate days
    }
  }
  if (
    !this.isNew &&
    (this.isModified("title") || this.isModified("description"))
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
  }
  delete this.targetLang;
  next();
});

const AdsPopup = mongoose.model("AdsPopup", adsPopupSchema);

module.exports = AdsPopup;
