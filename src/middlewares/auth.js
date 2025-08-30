const passport = require("passport");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const getLogger = require("../config/logger");
const logger = getLogger("AUTH");
const idMapper = {
  partner: "partnerId",
  customer: "customerId",
};
const verifyCallback =
  (req, resolve, reject, roles) => async (err, user, info) => {
    if (err || info || !user) {
      logger.error(
        "THE ERROR OCCUR ERR:::::::::: " +
          err +
          "  THE INFO IS::::::::::::: " +
          info +
          "  THE USER IS::::::::" +
          user
      );
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate")
      );
    }
    logger.info(`Request USER Detail ::: ${user.email} :::`);
    req.user = user;
    if (roles.length) {
      id = idMapper[user.userType];
      if (!roles.includes(user.userType)) {
        if (req.params[id] && req.params[id] !== user.id)
          return reject(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
      }
    }

    resolve();
  };

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, resolve, reject, requiredRights)
      )(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
