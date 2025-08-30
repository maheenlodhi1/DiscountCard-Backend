const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const FirebaseTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ["customer", "partner"],
    required: true,
  },
  platform: {
    type: String,
    enum: ["android", "ios", "web"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

FirebaseTokenSchema.plugin(toJSON);
module.exports = mongoose.model("Firebase Tokens", FirebaseTokenSchema);
