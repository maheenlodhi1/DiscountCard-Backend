const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const {
  authService,
  userService,
  tokenService,
  emailService,
  referralService,
} = require("../services");
const config = require("../config/config");
const ApiError = require("../utils/ApiError");
const { generateOtp, verifyOtp } = require("../utils/CustomOtp");
const {
  generateResetPasswordToken,
  verifyToken,
} = require("../services/token.service");
const getUserService = require("../utils/userServiceFactory");
const { addTranslatedLocale } = require("../utils/addTranslatedLocale");

const sendInvite = catchAsync(async (req, res) => {
  const invite = await authService.sendSignupInvitation(req.body);
  if (!invite) {
    throw new ApiError(500, "Something went wrong");
  }
  res.status(httpStatus.OK).send({
    message: `Invitation has been sent successfully!`,
  });
});
const register = catchAsync(async (req, res) => {
  const { type } = req.body;
  req.body.targetLang = req.targetLang;
  const userService = await getUserService(type);
  const translateData = await addTranslatedLocale(req.body, [
    "firstName",
    "lastName",
    "businessName",
  ]);
  const user = await userService.createUser(translateData, "user");
  if (type == "customer") {
    const refereeModel = type === "customer" ? "Customers" : "Partners";
    const referral = await referralService.createReferral({
      referee: user.id,
      refereeModel,
    });
    user.referralHistory = referral.id;
    await user.save();
    if (req.body.referBy) {
      await referralService.updateReferralHistory({
        referralId: req?.body?.referBy,
        userId: user.id,
      });
    }
  }
  const otp = await generateOtp(req.body.email);
  await emailService.sendVerificationOtpEmail(req.body.email, otp);
  res
    .status(httpStatus.OK)
    .send({ message: `You are registered successfully` });
});

const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.query;
  const tokenVerified = await authService.verifyEmail(token);
  let redirectUrl = config.clientUrl;
  if (tokenVerified && tokenVerified.type == "verifyEmail") {
    const user = await userService.createUser(tokenVerified.sub);
    redirectUrl += `auth/verifyEmail`;
    res.redirect(redirectUrl);
  }
  res.status(200).send({ verified: true });
});

const login = catchAsync(async (req, res) => {
  const { email, password, type, isApp } = req.body;

  const user = await authService.loginUserWithEmailAndPassword(
    email,
    password,
    type
  );
  const tokens = await tokenService.generateAuthTokens(user, isApp);
  res.send({ user, tokens });
});

const logout = async (req, res) => {
  await authService.logout(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
};

const forgotPassword = catchAsync(async (req, res) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d+$/;
  const { recipient } = req.body;
  const otp = await generateOtp(recipient);
  if (phoneRegex.test(recipient)) {
    const user = await userService.getUserByPhoneNumber(recipient);
    if (!user) {
      throw new ApiError("Account not found with this number");
    }
    const message = `OTP for DiscountCard: ${otp}`;
    // const data = await sendSms(recipient, message);
  } else if (emailRegex.test(recipient)) {
    const user = await userService.getUserByEmail(recipient);
    if (!user) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Account not found with this email"
      );
    }
    await emailService.sendVerificationOtpEmail(recipient, otp);
  } else throw new ApiError(httpStatus.BAD_REQUEST, "Invalid recipient found!");

  res.status(httpStatus.OK).send({
    otp,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  const user = await verifyToken(token);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, `${type} not found!`);
  }
  await authService.resetPassword(user.sub, password);
  res.status(httpStatus.CREATED).send("Password Reset Successfully");
});

const changePassword = catchAsync(async (req, res) => {
  const user = await userService.changePassword(req.user.id, req.body);
  res.status(httpStatus.OK).send({
    message: "Password changed successfully",
  });
});
const sendOtp = catchAsync(async (req, res) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d+$/;
  const { recipient } = req.body;
  // await tokenRequestLimiter("sendOtp", recipient);
  const otp = await generateOtp(recipient);
  if (phoneRegex.test(recipient)) {
    const message = `OTP for DiscountCard: ${otp}`;
    const data = await sendSms(recipient, message);
  } else if (emailRegex.test(recipient)) {
    await emailService.sendVerificationOtpEmail(recipient, otp);
  } else throw new ApiError(httpStatus.BAD_REQUEST, "Invalid recipient found!");

  res.status(httpStatus.OK).send({
    otp,
  });
});
const verifyUserOtp = catchAsync(async (req, res) => {
  const isValid = await verifyOtp(req.body.otp, req.body.recipient);
  let resObj = { isValid };
  const { recipient, context } = req.body;
  if (isValid) {
    if (context == "register") {
      await userService.updateUserByEmailOrNumber(recipient, {
        isEmailVerified: true,
      });
    } else if (context == "resetPassword") {
      const token = await generateResetPasswordToken(recipient);
      resObj["token"] = token;
    }
  }
  res.status(httpStatus.OK).send(resObj);
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ tokens });
});

const getAuthUserDetails = catchAsync(async (req, res) => {
  if (req.user.userType === "customer") {
    const user = req.user;
    await user.populate([
      { path: "referralHistory", select: "referralLink" },
      { path: "wallet", select: "balance" },
    ]);
    return res.status(httpStatus.OK).send(user);
  } else if (req.user.userType === "partner") {
    const user = req.user;
    await user.populate("offers", "discount");
    return res.status(httpStatus.OK).send(user);
  }
});
module.exports = {
  sendInvite,
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  sendOtp,
  verifyUserOtp,
  refreshTokens,
  getAuthUserDetails,
};
