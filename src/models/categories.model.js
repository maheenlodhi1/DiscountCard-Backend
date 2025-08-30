const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const { translateText } = require("../utils/translateText");

const categorySchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    subTitle: {
      type: String,
      trim: true,
    },
    img: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    orders: {
      type: Number,
    },
    locale: {
      ar: {
        title: {
          type: String,
          trim: true,
        },
      },
      en: {
        title: {
          type: String,
          trim: true,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.pre("save", async function (next) {
  if (!this.isNew && this.isModified("title")) {
    const targetLang = this.targetLang || "ar";
    const toLang = (targetLang || "ar") === "ar" ? "en" : "ar";

    if (this.isModified("title") && this.title) {
      this.locale[toLang].title = await translateText(this.title, toLang);
      this.locale[targetLang].title = this.title;
    }
  }
  delete this.targetLang;
  next();
});

// add plugin that converts mongoose to json
categorySchema.plugin(toJSON);
categorySchema.plugin(paginate);

/**
 * @typedef Category
 */
const Category = mongoose.model("Categories", categorySchema);

module.exports = Category;
