const jwt = require("jsonwebtoken");
const moment = require("moment");
const httpStatus = require("http-status");
const config = require("../config/config");
const userService = require("./user.service");
const ApiError = require("../utils/ApiError");
const { tokenTypes } = require("../config/tokens");
const catchAsync = require("../utils/catchAsync");
const { Token } = require("../models");
const getUserService = require("../utils/userServiceFactory");

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = expires
    ? {
        sub: userId,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
        iss: config.jwt.issuer,
      }
    : {
        sub: userId,
        iat: moment().unix(),
        type,
        iss: config.jwt.issuer,
      };

  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token) => {
  if (await isRevokedToken(token))
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your token has been revoked");
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user, isApp = false) => {
  const accessTokenExpires = moment().add(
    config.jwt.accessExpirationMinutes,
    "minutes"
  );
  const accessToken = generateToken(
    { id: user.id, aud: user.userType },
    isApp ? null : accessTokenExpires,
    tokenTypes.ACCESS
  );
  const refreshTokenExpires = moment().add(
    config.jwt.refreshExpirationDays,
    "days"
  );
  const refreshToken = generateToken(
    { id: user.id, aud: user.userType },
    isApp ? null : refreshTokenExpires,
    tokenTypes.REFRESH
  );

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  let user;
  user = await userService.getUserByEmailOrNumber(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "No user found with this email");
  }
  const expires = moment().add(
    config.jwt.resetPasswordExpirationMinutes,
    "minutes"
  );
  const resetPasswordToken = generateToken(
    user.id,
    expires,
    tokenTypes.RESET_PASSWORD
  );
  return { resetPasswordToken, username: user.firstName };
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (email) => {
  const expires = moment().add(
    config.jwt.verifyEmailExpirationMinutes,
    "minutes"
  );
  const verifyEmailToken = generateToken(
    email,
    expires,
    tokenTypes.VERIFY_EMAIL
  );

  return verifyEmailToken;
};
const generateInvitationEmailToken = async (email) => {
  const expires = moment().add(
    config.jwt.verifyEmailExpirationMinutes,
    "minutes"
  );
  const inviteEmailToken = generateToken(
    email,
    expires,
    tokenTypes.INVITATION_EMAIL
  );

  return inviteEmailToken;
};
const generateChatLinkToken = async (chat) => {
  const expires = moment().add(config.jwt.chatLinkExpirationDays, "days");
  const chatLink = generateToken(chat, expires, tokenTypes.CHAT_LINK);
  return chatLink;
};
const saveRevokedToken = async (token, type) => {
  return Token.create({ token, type });
};
const isRevokedToken = async (token) => {
  const revoked = await Token.findOne({ token });

  return revoked;
};

const resetPasswordRetryCount = async (userEmail, type = "resetPassword") => {
  const userRetryCount = Token.findOne({ userEmail, type });
  if (!userRetryCount) {
    throw new ApiError(httpStatus.NOT_FOUND, "No user found with this email");
  }
  userRetryCount.retryCount = 0;
  return userRetryCount.save();
};

const getUserPasswordRetry = async (userEmail, type) => {
  return Token.findOne({ userEmail, type });
};

const createPasswordRetryToken = async (userEmail, type) => {
  return Token.create({ userEmail, type });
};
module.exports = {
  generateToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  generateInvitationEmailToken,
  saveRevokedToken,
  generateChatLinkToken,
  resetPasswordRetryCount,
  getUserPasswordRetry,
  createPasswordRetryToken,
  verifyToken,
};
