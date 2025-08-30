const httpStatus = require("http-status");
const config = require("../config/config");
const { tokenService } = require("../services");
const ApiError = require("../utils/ApiError");
const tokenRequestLimiter = async (tokenType, email) => {
  const resetPasswordInterval = config.jwt.passwordResetInterval * 60 * 1000;
  const getUserRetry = await tokenService.getUserPasswordRetry(
    email,
    tokenType
  );
  const today = new Date();
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  if (!getUserRetry) {
    await tokenService.createPasswordRetryToken(email, tokenType);
  } else if (getUserRetry && oneDayAgo > getUserRetry.creationDate) {
    getUserRetry.retryCount = 0;
    getUserRetry.creationDate = today;
  } else if (
    oneDayAgo <= getUserRetry.creationDate &&
    getUserRetry.retryCount >= config.jwt.resetPasswordRetries
  ) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      `Your ${tokenType} limit has been reached.Please try again later`
    );
  } else if (new Date() - getUserRetry.updatedAt < resetPasswordInterval) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      `You could not sent concurrent requests in ${config.jwt.passwordResetInterval} minutes`
    );
  }
  if (getUserRetry) {
    getUserRetry.retryCount += 1;
    await getUserRetry.save();
  }
};
module.exports = {
  tokenRequestLimiter,
};
