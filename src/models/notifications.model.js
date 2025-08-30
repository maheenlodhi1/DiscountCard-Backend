const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["in-app", "broadcast"],
      default: "broadcast",
    },
    targetUsers: {
      type: String,
      enum: ["all", "customers", "partners"],
      default: "all",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    additionalData: {
      type: Object, // To store optional metadata like deep links, URLs, etc.
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["created", "pending", "sent", "failed"],
      default: "created",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
NotificationSchema.plugin(toJSON);
NotificationSchema.plugin(paginate);

/**
 * @typedef MembershipSubscriptions
 */
const Notifications = mongoose.model("Notifications", NotificationSchema);

module.exports = Notifications;
