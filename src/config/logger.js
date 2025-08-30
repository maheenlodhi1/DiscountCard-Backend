const winston = require("winston");
const config = require("./config");

const customFormat = winston.format.printf(({ level, message, context }) => {
  return `${context || "Application"} - ${level} - ${message}`;
});

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    info.message = info.stack;
  }
  return info;
});

const createLoggerInstance = (context) => {
  return winston.createLogger({
    level: config.env === "development" ? "debug" : "info",
    format: winston.format.combine(
      enumerateErrorFormat(),
      config.env === "development"
        ? winston.format.colorize()
        : winston.format.uncolorize(),
      winston.format.splat(),
      customFormat
    ),
    defaultMeta: { context: context || "Application" },
    transports: [
      new winston.transports.Console({
        stderrLevels: ["error"],
      }),
    ],
  });
};

const loggerCache = {};

const getLogger = (context) => {
  if (!loggerCache[context]) {
    loggerCache[context] = createLoggerInstance(context);
  }
  return loggerCache[context];
};

module.exports = getLogger;
