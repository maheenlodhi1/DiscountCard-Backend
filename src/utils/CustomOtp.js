const { totp, authenticator } = require("otplib");
const ApiError = require("./ApiError");
const httpStatus = require("http-status");
const genSecret =
  "0ab67d0693a52b2dce314764d3862709398b769674145e7a2c077127cb0dfac2";
totp.options = { digits: 6, step: 30, window: 10 };
const generateOtp = async (customSecret = "") => {
  const secret = genSecret + customSecret;
  const otp = totp.generate(secret);
  return otp;
};

const verifyOtp = async (otp, customSecret = "") => {
  const secret = genSecret + customSecret;
  const isValid = totp.verify({
    token: otp,
    secret,
    digits: 6,
    step: 30,
    window: 10,
  });
  if (!isValid) throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Invalid otp");
  return isValid;
};

module.exports = { generateOtp, verifyOtp };
