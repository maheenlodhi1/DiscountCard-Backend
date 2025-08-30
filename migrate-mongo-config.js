const mongoose = require("mongoose");
require("dotenv").config();

const config = {
  mongodb: {
    // Replace with your MongoDB URI
    url: process.env.MONGODB_URL,

    // Mongoose connection options
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  // Migrations directory
  migrationsDir: "migrations",

  // Name of the changelog collection
  changelogCollectionName: "changelog",

  // File extension for migration scripts
  migrationFileExtension: ".js",

  // Use file hash for determining changes
  useFileHash: false,

  // Module system
  moduleSystem: "commonjs",
};

module.exports = config;
