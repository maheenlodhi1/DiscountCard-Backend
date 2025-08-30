// models/PromotionEvent.js
const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const promotionEventSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    promotionId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Promotions",
      required: true,
      index: true,
    },

    categoryName: {
      type: String,
      trim: true,
      index: true,
    },

    eventType: {
      type: String,
      enum: ["view", "click", "redeem"],
      required: true,
      index: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // useful to separate real app traffic from any synthetic bootstrapping you might do locally
    source: {
      type: String,
      enum: ["app", "synthetic"],
      default: "app",
      index: true,
    },

    // if you want to capture where the event happened
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
      },
    },
  },
  { timestamps: true }
);

// indexes
promotionEventSchema.index({ location: "2dsphere" });
promotionEventSchema.index({
  userId: 1,
  promotionId: 1,
  eventType: 1,
  timestamp: -1,
});

// plugins
promotionEventSchema.plugin(toJSON);
promotionEventSchema.plugin(paginate);

const PromotionEvent = mongoose.model("PromotionEvents", promotionEventSchema);
module.exports = PromotionEvent;
