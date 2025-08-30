const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const { Customer, User } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");
const { withTransaction } = require("../utils/withTransaction");

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody, requester = "admin") => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken!");
  }
  if (await User.isPhoneNoTaken(userBody.phoneNo)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Phone number already taken!");
  }
  if (requester === "admin") {
    userBody.isEmailVerified = true;
  }
  const user = await Customer.create(userBody);
  return user;
};

const queryUsers = async (filter, options) => {
  const users = await Customer.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id, populate = true, referralHistory = false) => {
  const query = Customer.findOne({ _id: id, isDeleted: false });
  let populateOptions;
  if (populate) {
    populateOptions = [
      { path: "subscription", select: "-barcode -barcodeId" },
      { path: "wallet", select: "balance hasPayoutMethod" },
    ];

    if (referralHistory) {
      populateOptions.push({
        path: "referralHistory",
        select: "usageCount referralLink useHistory",
        populate: {
          path: "useHistory",
          model: "Customers",
          select: "email createdAt",
        },
      });
    } else {
      populateOptions.push({
        path: "referralHistory",
        select: "usageCount referralLink",
      });
    }

    query.populate(populateOptions);
  }

  return query.exec();
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return Customer.findOne({ email, isDeleted: false });
};

const getUserByPhoneNumber = async (phoneNo) => {
  return Customer.findOne({ phoneNo, isDeleted: false });
};

const checkEmail = async (email) => {
  if (await Customer.isEmailTaken(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  return true;
};

const checkPhoneNumber = async (phone) => {
  if (await Customer.isPhoneNoTaken(phone)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Phone Number already taken");
  }
  return true;
};
/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId, false);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (!user.isProfileCompleted) updateBody.isProfileCompleted = true;
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const getUserByEmailOrNumber = async (emailOrNumber, updateBody) => {
  const filter = {
    $or: [{ email: emailOrNumber }, { phoneNo: emailOrNumber }],
  };

  const updatedUser = await Customer.findOne(filter);
  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }
  return updatedUser;
};
const updateUserByEmailOrNumber = async (emailOrNumber, updateBody) => {
  const filter = {
    $or: [{ email: emailOrNumber }, { phoneNo: emailOrNumber }],
  };

  const updatedUser = await Customer.findOneAndUpdate(filter, updateBody);
  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }
  return updatedUser;
};
/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */

const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  user.isDeleted = true;
  await user.save();
  return user;
};

const googleLogin = async (userData) => {
  const user = await getUserByEmail(userData.email);
  if (user) {
    return user;
  }
  const newUser = await createUser(userData);
  return newUser;
};
const changePassword = async (userId, data) => {
  const user = await Customer.findById(userId);
  try {
    const res = await bcrypt.compare(data.oldPassword, Customer.password);
    if (res) {
      Object.assign(user, { password: data.newPassword });
      await Customer.save();
    } else throw new ApiError(httpStatus[422], "Old password didn't match");
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const getUsersForMembershipReminder = async () => {
  const now = new Date();
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(now.getDate() - 3);

  const lastReminderCycle = new Date();
  lastReminderCycle.setDate(now.getDate() - 7);

  const usersForFirstReminder = await Customer.find({
    createdAt: { $lte: threeDaysAgo },
    subscription: { $exists: false },
    lastReminderSentAt: { $exists: false },
  });

  const usersForSubsequentReminders = await Customer.find({
    createdAt: { $lte: lastReminderCycle },
    subscription: { $exists: false },
    lastReminderSentAt: { $lte: lastReminderCycle },
  });
  return [...usersForFirstReminder, ...usersForSubsequentReminders];
};

const getRawCustomers = async () => {
  const users = await Customer.find({ isDeleted: false });
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, "Users not found");
  }

  return users;
};
module.exports = {
  checkPhoneNumber,
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  checkEmail,
  googleLogin,
  changePassword,
  getUserByPhoneNumber,
  getUserByEmailOrNumber,
  updateUserByEmailOrNumber,
  getUsersForMembershipReminder,
  getRawCustomers,
};
