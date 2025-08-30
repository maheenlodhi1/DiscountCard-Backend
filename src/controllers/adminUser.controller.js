const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const {
  adminService,
  emailService,
  tokenService,
  promotionService,
  userService,
  SubscriptionsServices,
  adminSettingsServices,
} = require("../services");
const { searchQueryConverter } = require("../utils/searchQueryConverter");
const config = require("../config/config");
const { tokenRequestLimiter } = require("../utils/tokenRequestLimiter");
const updateUser = catchAsync(async (req, res) => {
  const user = await adminService.updateAdminUserById(
    req.params.userId,
    req.body
  );
  res.status(httpStatus.OK).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  let filter = pick(req.query, ["isActive", "role", "isApproved", "search"]);
  if (filter.search) {
    let searchQuery = searchQueryConverter(filter.search);
    filter = {
      ...filter,
      ...searchQuery,
    };
    delete filter["search"];
  }
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await adminService.queryUsers(filter, options);

  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await adminService.getAdminUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await adminService.deleteAdminUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const login = catchAsync(async (req, res) => {
  const user = await adminService.getAdminUserByEmail(req.body.email);
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Admin user not found with this email!"
    );
  } else if (!(await user.isPasswordMatch(req.body.password))) {
    throw new ApiError(httpStatus.NOT_FOUND, "Incorrect password!");
  }
  const token = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).send({ user, token });
});

const register = catchAsync(async (req, res) => {
  const user = await adminService.createAdminUser(req.body);
  res.status(httpStatus.OK).send(user);
});

const geCurrentUser = catchAsync(async (req, res) => {
  const a = 0;
  res.status(httpStatus.OK).send(req.user);
});

const forgotPassword = catchAsync(async (req, res) => {
  await tokenRequestLimiter("resetPassword", req.body.email);
  const { resetPasswordToken, username } =
    await tokenService.generateResetPasswordToken(
      req.body.email,
      req.body.type
    );
  await emailService.sendResetPasswordEmail(
    req.body.email,
    username,
    resetPasswordToken,
    req.body.type
  );

  res.status(httpStatus.OK).send({
    message: "Reset password Email has been sent successfully!",
  });
});

const resetPassword = catchAsync(async (req, res) => {
  try {
    const user = await tokenService.verifyToken(req.body.token);
    if (!user) {
      throw new Error();
    }
    await adminService.updateAdminUserById(Object.values(user)[0], {
      password: req.body.password,
    });
  } catch (error) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      `Password reset failed ${error}`
    );
  }
  res.status(httpStatus.CREATED).send("Password Reset Successfully");
});
const getDashboardStats = catchAsync(async (req, res) => {
  const [promotions, partners, customers, memberships] = await Promise.all([
    promotionService.getLastMonthStats(),
    userService.getUserStats("partner"),
    userService.getUserStats("customer"),
    SubscriptionsServices.getLastMonthStats(),
  ]);

  if (!promotions || !partners) {
    throw new ApiError(httpStatus.NO_CONTENT, "unable to fetch stats");
  }
  res
    .status(httpStatus.OK)
    .send({ promotions, partners, customers, memberships });
});
const setReferralCommission = catchAsync(async (req, res) => {
  const payload = {
    type: "referralCommission",
    data: { referralCommission: req.body.referralCommission },
  };
  const referralCommission = await adminSettingsServices.createData(payload);

  res.status(httpStatus.CREATED).send(referralCommission);
});

const updateReferralCommission = catchAsync(async (req, res) => {
  const data = { data: { referralCommission: req.body.referralCommission } };
  const referralCommission = await adminSettingsServices.updateData(
    req.params.id,
    data
  );
  res.status(httpStatus.OK).send(referralCommission);
});

const getReferralCommission = catchAsync(async (req, res) => {
  const referralCommission = await adminSettingsServices.getDataByType(
    "referralCommission"
  );
  res.status(httpStatus.OK).send(referralCommission);
});

module.exports = {
  updateUser,
  getUsers,
  getUser,
  deleteUser,
  login,
  register,
  forgotPassword,
  resetPassword,
  getDashboardStats,
  geCurrentUser,
  updateReferralCommission,
  setReferralCommission,
  getReferralCommission,
};
