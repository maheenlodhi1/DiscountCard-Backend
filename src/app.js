const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const cors = require("cors");
const passport = require("passport");
const httpStatus = require("http-status");
const config = require("./config/config");
const morgan = require("./config/morgan");
const { jwtStrategy } = require("./config/passport");
const { authLimiter } = require("./middlewares/rateLimiter");
const routes = require("./routes");
const { errorConverter, errorHandler } = require("./middlewares/error");
const ApiError = require("./utils/ApiError");
const path = require("path");

const faviconPath = path.join(__dirname, "public", "favicon.ico");
const serverRunning = path.join(
  __dirname,
  "emailtemplates",
  "serverrunning.html"
);

const app = express();
// Serve static files from the 'public' directory
app.use(express.static("public"));

if (config.env !== "test") {
  app.use(morgan.requestLogger);
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}
// Serve the favicon.ico file
app.get("/favicon.ico", (req, res) => {
  res.sendFile(faviconPath);
});

// set security HTTP headers
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "https: data:"],
    },
  })
);

// sanitize request data
app.use(xss());

app.use("/api/v1/stripe/webhook", express.raw({ type: "*/*" }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: false }));
// parse json request body
app.use(express.json());
app.use("/api/v1/payments", express.raw({ type: "text/plain" }));
app.use(
  "/api/v1/payout-requests/:payoutRequestId",
  express.raw({ type: "text/plain" })
);

app.use((req, res, next) => {
  const acceptLanguage = req.headers["accept-language"];
  req.targetLang =
    acceptLanguage && acceptLanguage.includes("ar") ? "ar" : "en";
  next();
});

app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors

app.use(cors());
app.options("*", cors());

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);
// limit repeated failed requests to auth endpoints
if (config.env === "production") {
  app.use("/v1/auth", authLimiter);
}

// v1 api routes
app.get("/", (req, res) => {
  res.sendFile(serverRunning);
});

app.use("/api/v1", routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
