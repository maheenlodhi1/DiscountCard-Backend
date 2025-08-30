const mongoose = require("mongoose");
const http = require("http");
const app = require("./app");
const config = require("./config/config");
const { createSocketsServer } = require("./sockets");
require("./jobs/buyMembershipReminderJob");
const getLogger = require("./config/logger");
const logger = getLogger("SERVER");

const server = http.createServer(app);
const port = process.env.PORT || config.port;
mongoose.set("strictQuery", false);
mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(async () => {
    logger.info("Connected to MongoDB");
    server.listen(port, () => {
      logger.info(`Listening to port ${port}`);
      createSocketsServer(server);
    });
  });
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
