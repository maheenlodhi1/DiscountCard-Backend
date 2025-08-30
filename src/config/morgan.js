const morgan = require("morgan");
const config = require("./config");
const getLogger = require("./logger");
const logger = getLogger("REST");
morgan.token("message", (req, res) => res.locals.errorMessage || "");
const getIpFormat = () =>
  config.env === "production" ? ":remote-addr - " : "";
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: (message) => logger.info(message.trim()) },
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.error(message.trim()) },
});

const requestLogger = (req, res, next) => {
  let requestDetail = `Request received: ${req.method} ${req.originalUrl} from ${req.ip}`;
  if (req.body) {
    logDetail += `Request data ::: ${req.body}`;
  }

  logger.info(requestDetail);

  next();
};

module.exports = {
  successHandler,
  errorHandler,
  requestLogger,
};
