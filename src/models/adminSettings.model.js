const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const adminSettingsSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    type: {
      type: String,
    },
    data: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
adminSettingsSchema.plugin(toJSON);
adminSettingsSchema.plugin(paginate);

const AdminSettings = mongoose.model("Admin Settings", adminSettingsSchema);

module.exports = AdminSettings;
