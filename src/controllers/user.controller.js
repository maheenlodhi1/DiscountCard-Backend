const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const {
  userService,
  emailService,
  tokenService,
  walletService,
} = require("../services");
const { searchQueryConverter } = require("../utils/searchQueryConverter");

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
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
  filter.isDeleted = false;

  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});
const sendUserChatLink = catchAsync(async (req, res) => {
  const { chat, email, name } = req.body;
  const token = await tokenService.generateChatLinkToken(chat);
  await emailService.sendChatLinkEmail(
    email ? email : chat.senderId.email,
    name ? name : chat.senderId.firstName,
    token
  );
  await res.status(httpStatus.NO_CONTENT).send();
});

const addPaymentDetails = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found1");
  }
  const wallet = await walletService.addWalletPaymentDetails(req.body);
  res
    .status(httpStatus.NO_CONTENT)
    .send({ message: "Payments Details added successfully!" });
});

const updatePaymentDetails = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }
  const wallet = await walletService.updateUserWallet(userId, req.body);
  res
    .status(httpStatus.NO_CONTENT)
    .send({ message: "Payments Details updated successfully!" });
});

const getUserWallet = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }
  const wallet = await walletService.getWalletByUserId(userId, "user");
  res.status(httpStatus.OK).send(wallet);
});

module.exports = {
  updateUser,
  getUsers,
  getUser,
  deleteUser,
  sendUserChatLink,
  addPaymentDetails,
  updatePaymentDetails,
  getUserWallet,
};
